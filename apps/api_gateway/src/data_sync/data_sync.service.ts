import { ResponseDto } from "@app/share_lib/common.dto";
import { HttpStatus, Injectable } from "@nestjs/common";
import cds from "@sap/cds";

@Injectable()
export class DataSyncService {
  constructor() {}

  async GetAllHeader() // currentUser: CurrentUserDto,
  : Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      const sqlQuery = `
        SELECT
		      header.ID,
          header.SYNC_ID,
          header.SYNC_STARTED_AT,
          header.IS_SIMULATED,
          loginuser.USER_NAME
        FROM
          "FF9F2C685CB64B89B27EDD22961BD341"."PCF_DB_SYNC_HEADER"  AS header
        JOIN
          "FF9F2C685CB64B89B27EDD22961BD341"."PCF_DB_LOGIN_USER" AS loginuser ON header.CREATED_BY = loginuser.ID
        WHERE
          loginuser.IS_ACTIVE = 'Y'
        ORDER BY
    	    header.ID DESC;
          `;

      const syncHeaderDetails = await db.run(sqlQuery);

      if (!syncHeaderDetails || syncHeaderDetails.length === 0) {
        return {
          statuscode: HttpStatus.OK,
          message: "No header found",
          data: syncHeaderDetails,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "header fetched successfully",
        data: syncHeaderDetails,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: error,
      };
    }
  }

  async GetAllSyncDtls(
    hdrData, // currentUser: CurrentUserDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");
      const hdrId = hdrData.id;

      const sqlQuery = `SELECT
          details.ID,
          details.SYNC_HEADER_ID, 
          report.REPORT_NAME,
          details.SYNC_STARTED_AT,
          details.SYNC_ENDED_AT,
          details.SYNC_STATUS
        FROM
          "FF9F2C685CB64B89B27EDD22961BD341"."PCF_DB_SYNC_DETAILS"  AS details
        JOIN
          "FF9F2C685CB64B89B27EDD22961BD341"."PCF_DB_REPORT_MASTER" AS report ON details.REPORT_ID = report.ID
          WHERE SYNC_HEADER_ID = '${hdrId}'
      `;

      const alldtls = await db.run(sqlQuery);

      if (!alldtls || alldtls.length === 0) {
        return {
          statuscode: HttpStatus.OK,
          message: "No sync details found",
          data: alldtls,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "sync details fetched successfully",
        data: alldtls,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: error,
      };
    }
  }

  async GetSyncDtlsReportTableValue(
    hdrData, // currentUser: CurrentUserDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");
      const hdrName = hdrData.report_name;
      const hdrSyncId = hdrData.sync_header_id;

      const whereClause = cds.parse.expr(`SYNC_HEADER_ID = '${hdrSyncId}'`);

      // const sqlQuery = `SELECT * FROM "${hdrName}" WHERE SYNC_HEADER_ID = '${hdrSyncId} AND CUSTOMER_ID = '${hdrCustId}'`;

      // const alldtls = await db.read(hdrName).where(whereClause);
      const alldtls = await db.read(hdrName).where(whereClause);

      if (!alldtls || alldtls.length === 0) {
        return {
          statuscode: HttpStatus.OK,
          message: "No sync details found",
          data: alldtls,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "sync details fetched successfully",
        data: alldtls,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: error,
      };
    }
  }
}
