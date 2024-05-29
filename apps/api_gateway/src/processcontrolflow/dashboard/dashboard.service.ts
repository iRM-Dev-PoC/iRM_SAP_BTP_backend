import cds from "@sap/cds";

import { HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class DashboardService {
  /** Get all control check points api
   * by Racktim Guin
   */
  async getControlCheckPoints(): Promise<any> {
    try {
      const db = await cds.connect.to("db");

      const whereClause = cds.parse.expr(`IS_ACTIVE = 'Y'`);

      let allControlCheckpoints = await db
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
        if (item.ID == 3) {
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

      //chart clause based on sync header
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

      // Fetch column Chart Data
      try {
        const rawColumnChartData = await fetchChartData(controlId, 2, chartClause);
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

      // Base data query
      const baseDataQuery = `SELECT COUNT(ID) BASE_DATA FROM ZSD0070_BILLING_REPORT WHERE SYNC_HEADER_ID = ${hdrId}`;
      const baseDataCount = await db.run(baseDataQuery);

      // Exceptions count query
      const exceptionsQuery = `SELECT COUNT(ID) EXCEPTION_COUNT FROM PRICE_MISMATCH_OUT WHERE SYNC_HEADER_ID = ${hdrId}`;
      const exceptionsCount = await db.run(exceptionsQuery);

      // Calculate deviation
      const deviation =
        (exceptionsCount[0].EXCEPTION_COUNT / baseDataCount[0].BASE_DATA) * 100;

      // Violated data query
      const violatedQuery = `SELECT * FROM PRICE_MISMATCH_OUT WHERE SYNC_HEADER_ID = ${hdrId}`;
      const violatedData = await db.run(violatedQuery);

      // Sync header query
      const getSyncHeaderQuery = `SELECT ID, SYNC_ID FROM PCF_DB_SYNC_HEADER`;
      const getSyncHeaderData = await db.run(getSyncHeaderQuery);

      return {
        statuscode: HttpStatus.OK,
        message: "Data Fetched successfully!",
        data: {
          control_data: controlDetails[0],
          base_data_count: baseDataCount[0].BASE_DATA,
          exception_count: exceptionsCount[0].EXCEPTION_COUNT,
          deviation_count: deviation,
          risk_score: deviation * 100,
          violatedData,
          donutChartData,
          lineChartData,
          columnChartData,
        },
      };
    } catch (error) {
      console.error("Error fetching control data:", error.message);
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Can not fetch data!",
        error: error,
      };
    }
  }
}
