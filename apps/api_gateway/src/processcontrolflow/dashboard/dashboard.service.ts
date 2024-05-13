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
          item.RISK_SCORE = 50;
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
    const controId = controlDtls.id;
    const hdrId = controlDtls.hdrId;

    try {
      // get control details
      const db = await cds.connect.to("db");
      const whereClause = cds.parse.expr(
        `IS_ACTIVE = 'Y' AND ID = ${controId}`,
      );

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

      const getSyncHeaderQuery = `SELECT ID, SYNC_ID FROM PCF_DB_SYNC_HEADER`
      const getSyncHeaderData = await db.run(getSyncHeaderQuery);

      return {
        statuscode: HttpStatus.OK,
        message: "Data Fetched successfully!",
        data: {
          getSyncHeaderData: getSyncHeaderData,
          control_data: controlDetails[0],
          base_data_count: baseDataCount[0].BASE_DATA,
          exception_count: exceptionsCount[0].EXCEPTION_COUNT,
          deviation_count: deviation,
          risk_score: deviation * 100,
          violatedData: violatedData,
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
