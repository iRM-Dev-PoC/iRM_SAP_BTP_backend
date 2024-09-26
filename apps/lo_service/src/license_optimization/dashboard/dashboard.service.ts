import cds from "@sap/cds";

import { HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class DashboardService {
  async getUsersStatus(userStatus): Promise<any> {
    try {
      const { customer_id, hdrId } = userStatus;
      const db = await cds.connect.to("db");

      let activeUserQuery = `UFLAG NOT IN (32, 64, 128)
        AND DAYS_BETWEEN(TRDAT , CURRENT_DATE) < 90
        AND SYNC_HEADER_ID = ${hdrId}
        AND CUSTOMER_ID = ${customer_id}`;

      let inactiveUserQuery = `UFLAG IN (32, 64, 128)
        AND DAYS_BETWEEN(TRDAT , CURRENT_DATE) > 90
        AND SYNC_HEADER_ID = ${hdrId}
        AND CUSTOMER_ID = ${customer_id}`;

      let activeUser = await db.run(`SELECT DISTINCT * FROM LO_USR02 WHERE ${activeUserQuery}`);
      let inactiveUser = await db.run(
        `SELECT DISTINCT * FROM LO_USR02 WHERE ${inactiveUserQuery}`,
      );

      console.table(activeUser);
      console.table(inactiveUser);

      return {
        statuscode: HttpStatus.OK,
        message: "Data fetched successfully",
        data: {
          activeUsers: activeUser,
          inactiveUsers: inactiveUser,
        },
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

  async getActiveUsersRolesData(getActiveUsersRolesDto): Promise<any> {
    const { customer_id, hdrId } = getActiveUsersRolesDto;

    try {
      const db = await cds.connect.to("db");

      let activeUsersRoles = await db.run(
        `
        SELECT DISTINCT
          A."UNAME", 
          A."AGR_NAME"
        FROM 
            "FF9F2C685CB64B89B27EDD22961BD341"."LO_AGR_USERS" A
        JOIN 
            "FF9F2C685CB64B89B27EDD22961BD341"."LO_USR02" B
        ON 
            A."UNAME" = B."BNAME"
        WHERE 
            B."UFLAG" NOT IN (32, 64, 128)
            AND DAYS_BETWEEN(B."TRDAT", CURRENT_DATE) < 90 
            AND A."SYNC_HEADER_ID" = ${hdrId}
            AND A."CUSTOMER_ID" = ${customer_id}
            AND B."SYNC_HEADER_ID" = ${hdrId}
            AND B."CUSTOMER_ID" = ${customer_id}
            `,
      );

      console.table(activeUsersRoles);

      return {
        statuscode: HttpStatus.OK,
        message: "Data fetched successfully",
        data: activeUsersRoles,
      };
    } catch (error) {
      console.error("Error fetching active users roles:", error.message);
      return {
        statuscode: HttpStatus.BAD_REQUEST,
        message: "Cannot fetch active users roles!",
        data: error,
      };
    }
  }
}
