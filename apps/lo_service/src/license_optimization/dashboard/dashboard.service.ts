import cds from "@sap/cds";

import { HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class DashboardService {
  async getUsersStatus(userStatus): Promise<any> {
    try {
      const { customer_id, hdrId } = userStatus;
      const db = await cds.connect.to("db");

      let activeUserQuery = `UFLAG NOT IN (32, 64, 128)
        AND DAYS_BETWEEN(TRDAT , CURRENT_DATE) <= 90
        AND SYNC_HEADER_ID = ${hdrId}
        AND CUSTOMER_ID = ${customer_id}`;

      let inactiveUserQuery = `UFLAG IN (32, 64, 128)
        AND DAYS_BETWEEN(TRDAT , CURRENT_DATE) > 90
        AND SYNC_HEADER_ID = ${hdrId}
        AND CUSTOMER_ID = ${customer_id}`;

      let activeUser = await db.run(
        `SELECT DISTINCT
          BNAME AS "User name",
          GLTGV AS "User valid from", 
          GLTGB AS "User valid to", 
          USTYP AS "User Type",
          CLASS AS "User group",
          UFLAG AS "User Lock Status",
          ACCNT AS "Account ID",
          ANAME AS "Creator of the User",
          ERDAT AS "Creation Date of the User",
          TRDAT AS "Last Logon Date",
          LTIME AS "Last Logon Time",
          TZONE AS "Time Zone"
        FROM LO_USR02
        WHERE ${activeUserQuery}`,
      );
      let inactiveUser = await db.run(
        `SELECT DISTINCT
          BNAME AS "User name",
          GLTGV AS "User valid from", 
          GLTGB AS "User valid to", 
          USTYP AS "User Type",
          CLASS AS "User group",
          UFLAG AS "User Lock Status",
          ACCNT AS "Account ID",
          ANAME AS "Creator of the User",
          ERDAT AS "Creation Date of the User",
          TRDAT AS "Last Logon Date",
          LTIME AS "Last Logon Time",
          TZONE AS "Time Zone"
        FROM LO_USR02
        WHERE ${inactiveUserQuery}`,
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

  //----------  START DASHBOARD DATA  ------------
  async getDashboardData(userStatus): Promise<any> {
    try {
      const { customer_id, hdrId } = userStatus;
      const db = await cds.connect.to("db");

      //----------PIE CHART - BASED ON ACTIVE USER BY USER TYPE------------
      let activeUserQuery = `UFLAG NOT IN (32, 64, 128)
        AND DAYS_BETWEEN(TRDAT , CURRENT_DATE) <= 90
        AND SYNC_HEADER_ID = ${hdrId}
        AND CUSTOMER_ID = ${customer_id}`;

      let activeUserTypeData = await db.run(
        `
        SELECT
        USTYP AS "User Type",
        COUNT(USTYP) as "Count"
        FROM LO_USR02
        WHERE ${activeUserQuery}
        GROUP BY USTYP
        `,
      );

      console.table(activeUserTypeData);

      let transformedActiveUserTypeData = {
        series: activeUserTypeData.map((item, index) => ({
          name: item["User Type"],
          items: [
            {
              id: (index + 1).toString(),
              value: item.Count,
              labelDisplay: "LABEL",
              name: item["User Type"],
            },
          ],
        })),
      };

      //----------PIE CHART - BASED ON USER ROLES COUNT BY ROLE ASSIGNED------------
      let activeUserRoleCountData = await db.run(
        `
        WITH DistinctUserRoles AS (
          SELECT DISTINCT
            -- A."UNAME", 
            C."NAME_TEXTC",
            A."AGR_NAME"
          FROM 
            LO_AGR_USERS A
          JOIN 
            LO_USR02 B
          ON 
            A."UNAME" = B."BNAME"
          JOIN
            LO_USER_ADDR C
          ON
            A."UNAME" = C."BNAME"
          WHERE 
            B."UFLAG" NOT IN (32, 64, 128)
            AND DAYS_BETWEEN(B."TRDAT", CURRENT_DATE) <= 90
            AND A."SYNC_HEADER_ID" = ${hdrId}
            AND A."CUSTOMER_ID" = ${customer_id}
            AND B."SYNC_HEADER_ID" = ${hdrId}
            AND B."CUSTOMER_ID" = ${customer_id}
            AND C."SYNC_HEADER_ID" = ${hdrId}
            AND C."CUSTOMER_ID" = ${customer_id}
        )
        SELECT 
          --"UNAME" as "User Name",
          "NAME_TEXTC" as "User Name",
          COUNT("AGR_NAME") AS "Role Count"
        FROM 
          DistinctUserRoles
        GROUP BY 
          --"UNAME",
          "NAME_TEXTC"
        ORDER BY 
          "NAME_TEXTC";
        `,
      );

      console.table(activeUserRoleCountData);

      let transformedActiveUserRoleCountData = {
        series: activeUserRoleCountData.map((item, index) => ({
          name: item["User Name"],
          items: [
            {
              id: (index + 1).toString(),
              value: item["Role Count"],
              labelDisplay: "LABEL",
              name: item["User Name"],
            },
          ],
        })),
      };

      return {
        statuscode: HttpStatus.OK,
        message: "Data fetched successfully",
        data: {
          activeUserType: transformedActiveUserTypeData,
          activeUserRoleCount: transformedActiveUserRoleCountData,
        },
      };
    } catch (error) {
      console.error("Error fetching in active users type:", error.message);
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch active users type",
        data: error,
      };
    }
  }

  //----------  END DASHBOARD DATA  ------------

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
          LO_AGR_USERS A
        JOIN 
          LO_USR02 B
        ON 
          A."UNAME" = B."BNAME"
        WHERE 
          B."UFLAG" NOT IN (32, 64, 128)
          AND DAYS_BETWEEN(B."TRDAT", CURRENT_DATE) <= 90 
          AND A."SYNC_HEADER_ID" = ${hdrId}
          AND A."CUSTOMER_ID" = ${customer_id}
          AND B."SYNC_HEADER_ID" = ${hdrId}
          AND B."CUSTOMER_ID" = ${customer_id}
        ORDER BY 
          A."UNAME" ASC
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

  async getActiveUsersRolesDetails(getActiveUsersRoleDetailsDto): Promise<any> {
    const { customer_id, hdrId } = getActiveUsersRoleDetailsDto;

    try {
      const db = await cds.connect.to("db");

      let activeUsersRolesDetails = await db.run(
        `
        SELECT DISTINCT
            A."UNAME", 
            A."AGR_NAME", 
            C."LOW",
            C."OBJECT",
            C."FIELD",
            C."AUTH",
            B."UFLAG", 
            B."TRDAT"
        FROM 
            LO_AGR_USERS A
        JOIN 
            LO_USR02 B
        ON 
            A."UNAME" = B."BNAME"
        JOIN 
            LO_AGR_1251 C
        ON 
            A."AGR_NAME" = C."AGR_NAME"
        WHERE 
            B."UFLAG" NOT IN (32, 64, 128)
            AND DAYS_BETWEEN(B."TRDAT", CURRENT_DATE) < 90
            AND C.OBJECT = 'S_TCODE'
            AND C.FIELD = 'TCD'
            AND A."SYNC_HEADER_ID" = ${hdrId}
            AND A."CUSTOMER_ID" = ${customer_id}
            AND B."SYNC_HEADER_ID" = ${hdrId}
            AND B."CUSTOMER_ID" = ${customer_id}
            AND C."SYNC_HEADER_ID" = ${hdrId}
            AND C."CUSTOMER_ID" = ${customer_id}
        ORDER BY
            A."UNAME"
          `,
      );

      console.table(activeUsersRolesDetails);

      return {
        statuscode: HttpStatus.OK,
        message: "Data fetched successfully",
        data: activeUsersRolesDetails,
      };
    } catch (error) {
      console.error(
        "Error fetching active users roles details:",
        error.message,
      );
      return {
        statuscode: HttpStatus.BAD_REQUEST,
        message: "Cannot fetch active users roles details!",
        data: error,
      };
    }
  }

  async getActiveUsersRolesUsage(getActiveUsersRolesUsageDto): Promise<any> {
    const { customer_id, hdrId } = getActiveUsersRolesUsageDto;

    try {
      const db = await cds.connect.to("db");

      let activeUsersRolesUsage = await db.run(
        `
        WITH ActiveUsersDetails AS (
        SELECT DISTINCT
            A."UNAME", 
            A."AGR_NAME", 
            C."LOW",
            C."OBJECT",
            C."FIELD",
            C."AUTH",
            B."UFLAG", 
            B."TRDAT"
        FROM 
            LO_AGR_USERS A
        JOIN 
            LO_USR02 B
        ON 
            A."UNAME" = B."BNAME"
        JOIN 
            LO_AGR_1251 C
        ON 
            A."AGR_NAME" = C."AGR_NAME"
        WHERE 
            B."UFLAG" NOT IN (32, 64, 128)
            AND DAYS_BETWEEN(B."TRDAT", CURRENT_DATE) < 90
            AND C.OBJECT = 'S_TCODE'
            AND C.FIELD = 'TCD'
            AND A."SYNC_HEADER_ID" = ${hdrId}
            AND A."CUSTOMER_ID" = ${customer_id}
            AND B."SYNC_HEADER_ID" = ${hdrId}
            AND B."CUSTOMER_ID" = ${customer_id}
            AND C."SYNC_HEADER_ID" = ${hdrId}
            AND C."CUSTOMER_ID" = ${customer_id}
        ),
        RolesUsage AS (
          SELECT DISTINCT 
            TRANSACTION_CODE, 
            USER
          FROM 
            LO_SM20 
          WHERE 
            TRANSACTION_CODE NOT IN ('S000', 'SESSION_MANAGER')
            AND "SYNC_HEADER_ID" = ${hdrId}
            AND "CUSTOMER_ID" = ${customer_id}
        )
        SELECT DISTINCT
          AUD."UNAME",
          AUD."LOW",
          RU."TRANSACTION_CODE"
          FROM 
            ActiveUsersDetails AUD
          JOIN 
            RolesUsage RU
          ON 
            AUD."UNAME" = RU."USER"
        WHERE 
          AUD."LOW" != RU."TRANSACTION_CODE"
        ORDER BY
          AUD."UNAME"
        `,
      );

      console.table(activeUsersRolesUsage);

      return {
        statuscode: HttpStatus.OK,
        message: "Data fetched successfully",
        data: activeUsersRolesUsage,
      };
    } catch (error) {
      console.error(
        "Error fetching active users roles details:",
        error.message,
      );
      return {
        statuscode: HttpStatus.BAD_REQUEST,
        message: "Cannot fetch active users roles details!",
        data: error,
      };
    }
  }

  async getActiveUsersRolesUsageCount(
    getActiveUsersRolesUsageCountDto,
  ): Promise<any> {
    const { customer_id, hdrId } = getActiveUsersRolesUsageCountDto;

    try {
      const db = await cds.connect.to("db");

      let activeUsersRolesUsageCount = await db.run(
        `
        WITH ActiveUsers AS (
          SELECT 
              "BNAME",
              "CLASS",
              "USTYP",
              "ANAME"
          FROM 
              LO_USR02 
          WHERE 
              "UFLAG" NOT IN (32, 64, 128)
              AND DAYS_BETWEEN("TRDAT", CURRENT_DATE) < 90
              AND "SYNC_HEADER_ID" = ${hdrId}
              AND "CUSTOMER_ID" = ${customer_id}
        ),
        RolesUsage AS (
            SELECT  
              TRANSACTION_CODE, 
              USER
            FROM 
              LO_SM20 
            WHERE 
              TRANSACTION_CODE NOT IN ('S000', 'SESSION_MANAGER')
              AND "SYNC_HEADER_ID" = ${hdrId}
              AND "CUSTOMER_ID" = ${customer_id}
          )
        SELECT 
            -- AU."BNAME",
            UADDR."NAME_TEXTC" AS USER_NAME,
            AU."ANAME",
            AU."CLASS",
            AU."USTYP",
            UADDR."DEPARTMENT",
            RU."TRANSACTION_CODE",
            -- TT."TRANSACTION_TEXT",
            COUNT(RU."TRANSACTION_CODE") AS "TRANSACTION_COUNT"
        FROM 
            ActiveUsers AU
        JOIN 
            RolesUsage RU
        ON 
            AU."BNAME" = RU."USER"
        JOIN
          LO_USER_ADDR UADDR
        ON
          AU."BNAME" = UADDR."BNAME"
        -- JOIN
        --   LO_TSTC TT
        -- ON
        --   RU."TRANSACTION_CODE" = TT."TCODE"
            GROUP BY
                -- AU."BNAME",
                UADDR."NAME_TEXTC",
                RU."TRANSACTION_CODE",
                -- TT."TRANSACTION_TEXT",
                AU."CLASS",
                AU."USTYP",
                AU."ANAME",
                UADDR."DEPARTMENT"
            ORDER BY
                -- AU."BNAME",
                UADDR."NAME_TEXTC",
                "TRANSACTION_COUNT" DESC;
        `,
      );

      const transformedResult = activeUsersRolesUsageCount.reduce(
        (acc, curr) => {
          const {
            USER_NAME,
            ANAME,
            CLASS,
            USTYP,
            DEPARTMENT,
            TRANSACTION_CODE,
            TRANSACTION_COUNT,
          } = curr;

          if (!acc[USER_NAME]) {
            // Initialize the structure for a new user
            acc[USER_NAME] = {
              USER_NAME,
              userDetails: {
                ANAME,
                CLASS,
                USTYP,
                DEPARTMENT,
              },
              transactions: [],
              bar_chart: [
                {
                  name: USER_NAME,
                  assignedToY2: "off",
                  displayInLegend: "auto",
                  items: [],
                },
              ],
            };
          }

          // Add transaction data
          const transactionIndex = acc[USER_NAME].transactions.length;
          acc[USER_NAME].transactions.push({
            [`TRANSACTION_CODE_${transactionIndex}`]: TRANSACTION_CODE,
            [`TRANSACTION_COUNT_${transactionIndex}`]: TRANSACTION_COUNT,
          });

          // Add bar chart item
          acc[USER_NAME].bar_chart[0].items.push({
            id: (acc[USER_NAME].bar_chart[0].items.length + 1).toString(),
            value: TRANSACTION_COUNT,
            name: TRANSACTION_CODE,
            labelPosition: "none",
          });

          return acc;
        },
        {},
      );

      const resultArray = Object.values(transformedResult);

      console.log(resultArray);

      return {
        statuscode: HttpStatus.OK,
        message: "Data fetched successfully",
        data: resultArray,
      };
    } catch (error) {
      console.error(
        "Error fetching active users roles details:",
        error.message,
      );
      return {
        statuscode: HttpStatus.BAD_REQUEST,
        message: "Cannot fetch active users roles details!",
        data: error,
      };
    }
  }
}
