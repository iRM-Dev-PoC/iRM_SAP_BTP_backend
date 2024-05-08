import { CurrentUserDto, ResponseDto } from "@app/share_lib/common.dto";
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
          "39131F99F8F44FB4A0F0F6D759497FF7"."PCF_DB_SYNC_HEADER"  AS header
        JOIN
          "39131F99F8F44FB4A0F0F6D759497FF7"."PCF_DB_LOGIN_USER" AS loginuser ON header.CREATED_BY = loginuser.ID
        WHERE
          loginuser.IS_ACTIVE = 'Y'
          ;`;

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

      const alldtls = await db
        .read("PCF_DB_SYNC_DETAILS")
        .where({ SYNC_HEADER_ID: hdrId });

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
