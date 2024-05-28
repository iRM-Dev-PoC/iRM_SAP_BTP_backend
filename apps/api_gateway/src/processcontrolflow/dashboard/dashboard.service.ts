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
      // get control details
      const db = await cds.connect.to("db");
      const whereClause = cds.parse.expr(
        `IS_ACTIVE = 'Y' AND ID = ${controlId}`,
      );

      //TESTING START
      const chartClause = `WHERE SYNC_HEADER_ID = ${hdrId}`;

      let pieChartData;
      let barChartData;
      let lineChartData;

      //Pie Chart
      try {
        const pieClause = cds.parse.expr(
          `CONTROL_ID = ${controlId} AND CHART_ID = 1`,
        );

        const chartDetails = await db
          .read("PCF_DB_DASHBOARD_DATA")
          .columns("QUERY", "GROUP_CLAUSE")
          .where(pieClause);

        if (!chartDetails.length) {
          throw new Error("No chart details found for the given control ID");
        }

        const queryData = chartDetails[0].QUERY;
        const groupClauseData = chartDetails[0].GROUP_CLAUSE;
        const combinedString = `${queryData} ${chartClause} ${groupClauseData}`;

        pieChartData = await db.run(combinedString);
      } catch (error) {
        console.error("Error fetching pie chart data:", error.message);
        throw error;
      }

      //Bar Chart
      try {
        const barClause = cds.parse.expr(
          `CONTROL_ID = ${controlId} AND CHART_ID = 2`,
        );

        const chartDetails = await db
          .read("PCF_DB_DASHBOARD_DATA")
          .columns("QUERY", "GROUP_CLAUSE")
          .where(barClause);

        if (!chartDetails.length) {
          throw new Error("No chart details found for the given control ID");
        }

        const queryData = chartDetails[0].QUERY;
        const groupClauseData = chartDetails[0].GROUP_CLAUSE;
        const combinedString = `${queryData} ${chartClause}`;

        barChartData = await db.run(combinedString);
      } catch (error) {
        console.error("Error fetching line chart data:", error.message);
        throw error;
      }

      //line Chart
      try {
        const lineClause = cds.parse.expr(
          `CONTROL_ID = ${controlId} AND CHART_ID = 3`,
        );

        const chartDetails = await db
          .read("PCF_DB_DASHBOARD_DATA")
          .columns("QUERY", "GROUP_CLAUSE")
          .where(lineClause);

        if (!chartDetails.length) {
          throw new Error("No chart details found for the given control ID");
        }

        const queryData = chartDetails[0].QUERY;
        const groupClauseData = chartDetails[0].GROUP_CLAUSE;
        const combinedString = `${queryData} ${chartClause}`;

        lineChartData = await db.run(combinedString);
      } catch (error) {
        console.error("Error fetching line chart data:", error.message);
        throw error;
      }

      //TESTING END

      const controlDetails = await db
        .read("PCF_DB_CHECK_POINT_MASTER")
        .where(whereClause);
      const query = `SELECT COUNT(ID) BASE_DATA FROM ZSD0070_BILLING_REPORT WHERE SYNC_HEADER_ID = ${hdrId}`;

      const baseDataCount = await db.run(query); // base data of the sync

      const exceptionsQuery = `select count(id) exception_count from PRICE_MISMATCH_OUT where sync_header_id = ${hdrId}`;
      const exceptionsCount = await db.run(exceptionsQuery); // exception counts

      const deviation =
        (exceptionsCount[0].EXCEPTION_COUNT / baseDataCount[0].BASE_DATA) * 100;

      // violated data
      const violatedQuery = `select * from PRICE_MISMATCH_OUT where sync_header_id = ${hdrId}`;
      const violatedData = await db.run(violatedQuery);

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
          violatedData: violatedData,
          pie_Chart_Data: pieChartData,
          line_Chart_Data: lineChartData,
          bar_Chart_Data: barChartData,
        },
      };
    } catch (error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Can not fetch data!",
        error: error,
      };
    }
  }
}
