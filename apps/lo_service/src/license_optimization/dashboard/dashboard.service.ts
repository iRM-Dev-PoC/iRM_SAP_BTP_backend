import cds from "@sap/cds";

import { HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class DashboardService {
  async getInactiveUsers(inactiveUsers): Promise<any> {
    try {
      
      const { customer_id, hdrId } = inactiveUsers;
      const db = await cds.connect.to("db");

      let inactiveUser = await db.run(`SELECT * FROM LO_USR02 
        WHERE UFLAG NOT IN (32, 64, 128)
        AND DAYS_BETWEEN(TRDAT , CURRENT_DATE) < 90
        AND SYNC_HEADER_ID = ${hdrId}
        AND CUSTOMER_ID = ${customer_id}`);
      
      console.table(inactiveUser);

      return {
        statuscode: HttpStatus.OK,
        message: "Data fetched successfully",
        data: inactiveUser,
      };
    } catch (error) {
      console.error("Error fetching in inactive users:", error.message);
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch inactive users",
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

      //------------------------------------------BOX PLOT START------------------------------------
      let boxPloting = {};

      if (controlId && hdrId) {
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

        function calculateMedian(values) {
          const mid = Math.floor(values.length / 2);
          return values.length % 2 !== 0
            ? values[mid]
            : (values[mid - 1] + values[mid]) / 2;
        }

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

          if (boxPlotingQuery.length === 0) {
            console.log("No data found for the given query.");
            boxPloting = {};
          } else {
            // Extract column names from 1st row
            const columns = Object.keys(boxPlotingQuery[0]);

            // Convert to Number
            const quartilesArray = columns.map((column) => {
              const values = boxPlotingQuery.map((row) => Number(row[column]));
              return calculateQuartiles(values);
            });

            // Formatting
            boxPloting = {
              categories: columns.map((col) => col.replace(/_/g, " ")),
              data: quartilesArray,
            };
          }
        }
      } else {
        boxPloting = {};
      }
      //------------------------------------------BOX PLOT END------------------------------------

      //------------------------------------------PIVOT TABLE START------------------------------------
      // PIVOT TABLE
      let pivotData = { headers: [], data: [] };
      if (controlId && hdrId) {
        const controlLogicClause = `ID = ${controlId}`;
        const syncHeaderClause = `WHERE SYNC_HEADER_ID = ${hdrId}`;
        const pivotDetails = await db
          .read("PCF_DB_CHECK_POINT_MASTER")
          .columns("PIVOT_QUERY")
          .where(controlLogicClause);

        if (
          !pivotDetails ||
          pivotDetails.length === 0 ||
          !pivotDetails[0].PIVOT_QUERY
        ) {
          console.log("No pivot query details found.");
          pivotData = { headers: [], data: [] };
        } else {
          const pivotDataQuery = await db.run(
            `${pivotDetails[0].PIVOT_QUERY} ${syncHeaderClause}`,
          );
          console.log(pivotDataQuery);

          if (pivotDataQuery.length === 0) {
            console.log("No data found for the given query.");
            pivotData = { headers: [], data: [] };
          } else {
            // Extract column names dynamically from the first row
            const columns = Object.keys(pivotDataQuery[0]);

            // Generate headers with type information
            pivotData.headers = columns.map((column) => {
              const sampleValue = pivotDataQuery[0][column];
              return {
                name: column,
                type: isNaN(Number(sampleValue)) ? "string" : "number",
              };
            });

            // Format the data dynamically
            pivotData.data = pivotDataQuery.map((row) => {
              let formattedRow = {};
              columns.forEach((column) => {
                // Attempt to convert value to number, if not possible keep it as string
                const value = isNaN(Number(row[column]))
                  ? row[column]
                  : Number(row[column]);
                formattedRow[column] = value;
              });
              return formattedRow;
            });
          }
        }
      } else {
        pivotData = { headers: [], data: [] };
      }

      console.log(pivotData);
      //------------------------------------------PIVOT TABLE END------------------------------------

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
          pivotData,
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
