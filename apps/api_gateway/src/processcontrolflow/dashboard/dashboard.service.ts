import cds from "@sap/cds";

import { HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class DashboardService {
  async getControlCheckPoints(filterDtls): Promise<any> {
    try {
      const { typeOfControlsId, hdrId } = filterDtls;

      const db = await cds.connect.to("db");

      let dynmcWhereClause = `IS_ACTIVE = 'Y'`;

      if (typeOfControlsId) { dynmcWhereClause += ` AND CONTROL_ID = ${typeOfControlsId}`; }

      const whereClause = cds.parse.expr(dynmcWhereClause);

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

      // Function to fetch necessary data for calculating deviation
      const fetchControlLogicData = async (controlId, hdrId) => {
        const controlLogicClause = { ID: controlId };
        const syncHeaderClause = `WHERE SYNC_HEADER_ID = ${hdrId}`;

        try {
          const controlLogicData = await db
            .read("PCF_DB_CHECK_POINT_MASTER")
            .columns("BASE_COUNT", "EXCEPTION_COUNT")
            .where(controlLogicClause);

          if (!controlLogicData.length) {
            throw new Error(
              "No control logic data found for the given control ID",
            );
          }

          const baseDataCount = await db.run(
            `${controlLogicData[0].BASE_COUNT} ${syncHeaderClause}`,
          );
          const exceptionDataCount = await db.run(
            `${controlLogicData[0].EXCEPTION_COUNT} ${syncHeaderClause}`,
          );

          return { baseDataCount, exceptionDataCount };
        } catch (error) {
          console.error("Error fetching control logic data:", error.message);
          throw error;
        }
      };

      // Modify RISK_SCORE based on calculated deviation
      const modifiedControlCheckpoints = await Promise.all(
        allControlCheckpoints.map(async (item) => {
          try {
            const { baseDataCount, exceptionDataCount } =
              await fetchControlLogicData(item.ID, hdrId);

            // Calculate deviation and risk score
            const deviation =
              (exceptionDataCount[0].EXCEPTION_COUNT /
                baseDataCount[0].BASE_DATA) *
              100;
            const riskScore = deviation;

            return { ...item, RISK_SCORE: riskScore };
          } catch (error) {
            console.error(
              `Error calculating risk score for checkpoint ID ${item.ID}:`,
              error.message,
            );
            return { ...item, RISK_SCORE: 0 };
          }
        }),
      );

      return {
        statuscode: HttpStatus.OK,
        message: "Data fetched successfully",
        data: modifiedControlCheckpoints,
      };
    } catch (error) {
      console.error("Error fetching control checkpoints:", error.message);
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

      // Fetch control details
      const controlDetails = await db
        .read("PCF_DB_CHECK_POINT_MASTER")
        .columns(
          "ID",
          "CHECK_POINT_NAME",
          "CHECK_POINT_DESC",
          "CONTROL_ID",
          "CUSTOMER_ID",
        )
        .where(whereClause);

      if (!controlDetails.length) {
        throw new Error("No control details found for the given control ID");
      }

      let baseAllData = [];
      let baseAllData1 = [];
      let baseAllData2 = [];
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
              "BASE_QUERY1",
              "BASE_QUERY2",
            )
            .where(controlLogicClause);

          if (!controlLogicData.length) {
            throw new Error(
              "No control logic data found for the given control ID",
            );
          }

          // BASE DATA COUNT
          const baseDataCount = await db.run(
            `${controlLogicData[0].BASE_COUNT} ${syncHeaderClause}`,
          );

          // ALL BASE DATA 0
          const baseAllDataResult = await db.run(
            `${controlLogicData[0].BASE_QUERY} ${syncHeaderClause}`,
          );

          // ALL BASE DATA 1
          const baseAllDataQuery1 = controlLogicData[0].BASE_QUERY1;
          const baseAllDataResult1 = baseAllDataQuery1
            ? await db.run(`${baseAllDataQuery1} ${syncHeaderClause}`)
            : [];

          // ALL BASE DATA 2
          const baseAllDataQuery2 = controlLogicData[0].BASE_QUERY2;
          const baseAllDataResult2 = baseAllDataQuery2
            ? await db.run(`${baseAllDataQuery2} ${syncHeaderClause}`)
            : [];

          // EXCEPTION DATA COUNT
          const exceptionDataCount = await db.run(
            `${controlLogicData[0].EXCEPTION_COUNT} ${syncHeaderClause}`,
          );

          // ALL EXCEPTION DATA
          const exceptionAllDataResult = await db.run(
            `${controlLogicData[0].EXCEPTION_QUERY} ${syncHeaderClause}`,
          );

          return {
            baseDataCount,
            baseAllData: baseAllDataResult,
            exceptionDataCount,
            exceptionAllData: exceptionAllDataResult,
            baseAllData1: baseAllDataResult1,
            baseAllData2: baseAllDataResult2,
          };
        } catch (error) {
          console.error("Error fetching control logic data:", error);
          throw error; 
        }
      };

      let baseDataCount, exceptionDataCount, deviation, violatedData;
      try {
        const result = await fetchControlLogicData(controlId, hdrId);
        baseDataCount = result.baseDataCount;
        baseAllData = result.baseAllData;
        baseAllData1 = result.baseAllData1;
        baseAllData2 = result.baseAllData2;
        exceptionDataCount = result.exceptionDataCount;
        exceptionAllData = result.exceptionAllData;

        deviation =
          (exceptionDataCount[0].EXCEPTION_COUNT / baseDataCount[0].BASE_DATA) *
          100;

        violatedData = exceptionAllData;
      } catch (error) {
        console.error("Error fetching base count:", error.message);
      }

      // BOX PLOT
      let boxPloting = {};

      if (controlId && hdrId) {
        // calculate quartiles
        function calculateQuartiles(values) {
          values.sort((a, b) => a - b);

          const min = values[0];
          const max = values[values.length - 1];
          const median = calculateMedian(values);
          const q1 = calculateMedian(
            values.slice(0, Math.floor(values.length / 2)),
          );
          const q3 = calculateMedian(
            values.slice(Math.ceil(values.length / 2)),
          );

          return [min, q1, median, q3, max];
        }

        // Function to calculate median
        function calculateMedian(values) {
          const mid = Math.floor(values.length / 2);
          return values.length % 2 !== 0
            ? values[mid]
            : (values[mid - 1] + values[mid]) / 2;
        }

        // Fetch data
        const controlLogicClause = `ID = ${controlId}`;
        const syncHeaderClause = `WHERE SYNC_HEADER_ID = ${hdrId}`;
        const boxPlotingDetails = await db
          .read("PCF_DB_CHECK_POINT_MASTER")
          .columns("BOX_PLOT")
          .where(controlLogicClause);

        if (
          !boxPlotingDetails ||
          boxPlotingDetails.length === 0 ||
          !boxPlotingDetails[0].BOX_PLOT
        ) {
          console.log("No box plotting details found.");
          boxPloting = {}; 
        } else {
          const boxPlotingQuery = await db.run(
            `${boxPlotingDetails[0].BOX_PLOT} ${syncHeaderClause}`,
          );
          console.log(boxPlotingQuery);

          if (boxPlotingQuery.length === 0) {
            console.log("No data found for the given query.");
            boxPloting = {}; 
          } else {
            // Extract column names dynamically from the first row
            const columns = Object.keys(boxPlotingQuery[0]);

            // Convert to numbers and calculate quartiles for each column
            const quartilesArray = columns.map((column) => {
              const values = boxPlotingQuery.map((row) => Number(row[column]));
              return calculateQuartiles(values);
            });

            // Format the output
            boxPloting = {
              categories: columns.map((col) => col.replace(/_/g, " ")), // Format category names
              data: quartilesArray,
            };
          }
        }
      } else {
        boxPloting = {};
      }

      return {
        statuscode: HttpStatus.OK,
        message: "Data Fetched successfully!",
        data: {
          control_data: controlDetails[0],
          base_data_count: baseDataCount[0].BASE_DATA,
          exception_count: exceptionDataCount[0].EXCEPTION_COUNT,
          deviation_count: deviation,
          risk_score: deviation,
          violatedData,
          baseAllData,
          baseAllData1,
          baseAllData2,
          boxPloting,
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
