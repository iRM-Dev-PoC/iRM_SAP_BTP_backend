import cds from "@sap/cds";

import { HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class DashboardService {
  /** Get all control check points api
   * by Racktim Guin
   */
  async getControlCheckPoints(filterDtls): Promise<any> {
    try {
      /** get filter data from the request body */
      const typeOfControlsId = filterDtls.typeOfControlsId;

      const db = await cds.connect.to("db");

      let dynmcWhereClause = `IS_ACTIVE = 'Y'`;

      if (typeOfControlsId) {
        dynmcWhereClause += ` AND CONTROL_ID = ${typeOfControlsId}`;
      }

      let whereClause = cds.parse.expr(dynmcWhereClause);

      // Read from PCF_DB_CHECK_POINT_MASTER
      const allControlCheckpoints = await db
        .read("PCF_DB_CHECK_POINT_MASTER")
        .where(whereClause);

      if (!allControlCheckpoints || allControlCheckpoints.length === 0) {
        return {
          statuscode: HttpStatus.OK,
          message: "No Control Check Points found",
          data: allControlCheckpoints,
        };
      }

      /** Modify RISK_SCORE as of now hard coded */
      allControlCheckpoints.forEach((item) => {
        if (item.ID === 3) {
          item.RISK_SCORE = 0.02157380939539399 * 100;
        } else {
          item.RISK_SCORE = 0;
        }
      });

      return {
        statuscode: HttpStatus.OK,
        message: "Data fetched successfully",
        data: allControlCheckpoints,
      };
    } catch (error) {
      console.error("Error fetching control checkpoints:", error);
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch check points",
        data: error,
      };
    }
  }

  /**
   * Get individual controls Data
   */
  async getControlData(controlDtls): Promise<any> {
    const controlId = controlDtls.id;
    const hdrId = controlDtls.hdrId;

    try {
      const db = await cds.connect.to("db");

      // Prepare where clause for control details
      const whereClause = cds.parse.expr(
        `IS_ACTIVE = 'Y' AND ID = ${controlId}`,
      );

      // Chart clause based on sync header
      const chartClause = `WHERE SYNC_HEADER_ID = ${hdrId}`;

      let donutChartData = [];
      let columnChartData = [];
      let lineChartData = [];

      // Function to fetch chart data
      const fetchChartData = async (controlId, chartId, chartClause) => {
        const chartClauseExpr = cds.parse.expr(
          `CONTROL_ID = ${controlId} AND CHART_ID = ${chartId}`,
        );

        const chartDetails = await db
          .read("PCF_DB_DASHBOARD_DATA")
          .columns("QUERY", "GROUP_CLAUSE")
          .where(chartClauseExpr);

        if (!chartDetails.length) {
          throw new Error("No chart details found for the given control ID");
        }

        const queryData = chartDetails[0].QUERY;
        const groupClauseData = chartDetails[0].GROUP_CLAUSE;
        const combinedString = `${queryData} ${chartClause} ${groupClauseData}`;

        const data = await db.run(combinedString);
        return data;
      };

      // Function to convert specified string fields to numbers in chart data
      const convertStringsToNumbers = (data, fields) => {
        return data.map((row) => {
          const convertedRow = { ...row };
          fields.forEach((field) => {
            if (
              convertedRow[field] !== undefined &&
              !isNaN(convertedRow[field])
            ) {
              convertedRow[field] = Number(convertedRow[field]);
            }
          });
          return convertedRow;
        });
      };

      // Fields to convert from string to number for line chart
      const lineChartFieldsToConvert = ["NET_VALUE", "TAX_AMOUNT", "COST"];

      // Fields to convert from string to number for column chart
      const columnChartFieldsToConvert = ["NET_VALUE", "TAX_AMOUNT", "COST"];

      // Fetch Donut Chart Data
      try {
        donutChartData = await fetchChartData(controlId, 1, chartClause);
      } catch (error) {
        console.error("Error fetching donut chart data:", error.message);
      }

      // Fetch Column Chart Data
      try {
        const rawColumnChartData = await fetchChartData(
          controlId,
          2,
          chartClause,
        );
        columnChartData = convertStringsToNumbers(
          rawColumnChartData,
          columnChartFieldsToConvert,
        );
      } catch (error) {
        console.error("Error fetching column chart data:", error.message);
      }

      // Fetch Line Chart Data
      try {
        const rawLineChartData = await fetchChartData(
          controlId,
          3,
          chartClause,
        );
        lineChartData = convertStringsToNumbers(
          rawLineChartData,
          lineChartFieldsToConvert,
        );
      } catch (error) {
        console.error("Error fetching line chart data:", error.message);
      }

      // Fetch control details
      const controlDetails = await db
        .read("PCF_DB_CHECK_POINT_MASTER")
        .where(whereClause);

      if (!controlDetails.length) {
        throw new Error("No control details found for the given control ID");
      }

      let baseCount = [];
      let baseAllData = [];
      let exceptionCount = [];
      let exceptionAllData = [];

      const fetchControlLogicData = async (controlId, hdrId) => {
        const controlLogicClause = `ID = ${controlId}`;
        const syncHeaderClause = `WHERE SYNC_HEADER_ID = ${hdrId}`;

        try {
          const controlLogicData = await db
            .read("PCF_DB_CHECK_POINT_MASTER")
            .columns(
              "BASE_COUNT",
              "BASE_QUERY",
              "EXCEPTION_COUNT",
              "EXCEPTION_QUERY",
            )
            .where(controlLogicClause);

          if (!controlLogicData.length) {
            throw new Error(
              "No control logic data found for the given control ID",
            );
          }

          // BASE DATA COUNT
          const baseCountDataQuery = controlLogicData[0].BASE_COUNT;
          const wholeBaseCountQuery = `${baseCountDataQuery} ${syncHeaderClause}`;
          const baseDataCount = await db.run(wholeBaseCountQuery);

          // ALL BASE DATA
          const baseAllDataQuery = controlLogicData[0].BASE_QUERY;
          const wholeBaseAllDataQuery = `${baseAllDataQuery} ${syncHeaderClause}`;
          const baseAllDataResult = await db.run(wholeBaseAllDataQuery);

          // EXCEPTION DATA COUNT
          const exceptionCountDataQuery = controlLogicData[0].EXCEPTION_COUNT;
          const wholeExceptionCountQuery = `${exceptionCountDataQuery} ${syncHeaderClause}`;
          const exceptionDataCount = await db.run(wholeExceptionCountQuery);

          // ALL EXCEPTION DATA
          const exceptionAllDataQuery = controlLogicData[0].EXCEPTION_QUERY;
          const wholeExceptionAllDataQuery = `${exceptionAllDataQuery} ${syncHeaderClause}`;
          const exceptionAllDataResult = await db.run(
            wholeExceptionAllDataQuery,
          );

          return {
            baseDataCount,
            baseAllData: baseAllDataResult,
            exceptionDataCount,
            exceptionAllData: exceptionAllDataResult,
          };
        } catch (error) {
          console.error("Error fetching control logic data:", error);
          throw error; // Re-throw the error to be handled by the caller
        }
      };

      let baseDataCount, exceptionDataCount, deviation, violatedData;
      try {
        const result = await fetchControlLogicData(controlId, hdrId);
        baseDataCount = result.baseDataCount;
        baseAllData = result.baseAllData;
        exceptionDataCount = result.exceptionDataCount;
        exceptionAllData = result.exceptionAllData;

        // Calculate deviation
        deviation =
          (exceptionDataCount[0].EXCEPTION_COUNT / baseDataCount[0].BASE_DATA) *
          100;

        // Assuming violatedData is fetched from some query based on your logic
        violatedData = exceptionAllData;

      } catch (error) {
        console.error("Error fetching base count:", error.message);
      }

      // Sync header query
      const getSyncHeaderQuery = `SELECT ID, SYNC_ID FROM PCF_DB_SYNC_HEADER`;
      const getSyncHeaderData = await db.run(getSyncHeaderQuery);

      return {
        statuscode: HttpStatus.OK,
        message: "Data Fetched successfully!",
        data: {
          control_data: controlDetails[0],
          base_data_count: baseDataCount[0].BASE_DATA,
          exception_count: exceptionDataCount[0].EXCEPTION_COUNT,
          deviation_count: deviation,
          risk_score: deviation * 100,
          violatedData,
          donutChartData,
          lineChartData,
          columnChartData,
          baseAllData,
          exceptionAllData
        },
      };
    } catch (error) {
      console.error("Error fetching control data:", error.message);
      return {
        statuscode: HttpStatus.BAD_REQUEST,
        message: "Cannot fetch data!",
        data: [],
      };
    }
  }

  /**
   * Get Control's Base and Exception data
   * based on Header Id, Control check point id
   */
  async getExceptionBaseData(controlDtls): Promise<any> {
    const controlId = controlDtls.id;
    const hdrId = controlDtls.hdrId;
    const flag = controlDtls.flag;
  }
}
