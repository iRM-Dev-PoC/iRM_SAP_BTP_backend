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
        AND USR.SYNC_HEADER_ID = ${hdrId}
        AND USR.CUSTOMER_ID = ${customer_id}`;

      let inactiveUserQuery = `
        NOT (
          UFLAG NOT IN (32, 64, 128) 
          AND DAYS_BETWEEN(TRDAT, CURRENT_DATE) <= 90
        )
          AND USR.SYNC_HEADER_ID = ${hdrId}
          AND USR.CUSTOMER_ID = ${customer_id}
        `;

      let activeUser = await db.run(
        `SELECT 
          USR.BNAME AS "User name",
          COALESCE(USRAD.NAME_TEXTC, 'Not Available') AS "User original name", 
          USR.GLTGV AS "User valid from", 
          USR.GLTGB AS "User valid to", 
          USR.USTYP AS "User Type",
          USR.CLASS AS "User group",
          USR.UFLAG AS "User Lock Status",
          USR.ACCNT AS "Account ID",
          USR.ANAME AS "Creator of the User",
          USR.ERDAT AS "Creation Date of the User",
          USR.TRDAT AS "Last Logon Date",
          USR.LTIME AS "Last Logon Time",
          USR.TZONE AS "Time Zone"
        FROM LO_USR02 USR
        LEFT JOIN LO_USER_ADDR USRAD
        ON USR.BNAME = USRAD.BNAME
        AND USRAD.SYNC_HEADER_ID = ${hdrId}
        AND USRAD.CUSTOMER_ID = ${customer_id}
        WHERE ${activeUserQuery}`,
      );
      let inactiveUser = await db.run(
        `SELECT DISTINCT
          USR.BNAME AS "User name",
          COALESCE(USRAD.NAME_TEXTC, 'Not Available') AS "User original name",
          USR.GLTGV AS "User valid from", 
          USR.GLTGB AS "User valid to", 
          USR.USTYP AS "User Type",
          USR.CLASS AS "User group",
          USR.UFLAG AS "User Lock Status",
          USR.ACCNT AS "Account ID",
          USR.ANAME AS "Creator of the User",
          USR.ERDAT AS "Creation Date of the User",
          USR.TRDAT AS "Last Logon Date",
          USR.LTIME AS "Last Logon Time",
          USR.TZONE AS "Time Zone"
        FROM LO_USR02 USR
        LEFT JOIN
        LO_USER_ADDR USRAD
        ON USR.BNAME = USRAD.BNAME
        AND USRAD.SYNC_HEADER_ID = ${hdrId}
        AND USRAD.CUSTOMER_ID = ${customer_id}
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

      let getTopRolesByActiveUserCount = await db.run(
        `
        SELECT 
          CONCAT(subquery."ROLE DESCRIPTION", ' : ') || subquery."ROLE NAME" AS "ROLE NAME",
          subquery."USER COUNT"
        FROM (
            SELECT TOP 10
                A."AGR_NAME" AS "ROLE NAME",
                D."TEXT" AS "ROLE DESCRIPTION",
                COUNT(A."UNAME") AS "USER COUNT"
            FROM 
                LO_AGR_USERS A
            JOIN 
                LO_USR02 B
            ON 
                A."UNAME" = B."BNAME"
            JOIN
                LO_AGR_DEFINE D
            ON
                A."AGR_NAME" = D."AGR_NAME"
            WHERE 
                B."UFLAG" NOT IN (32, 64, 128)
                AND DAYS_BETWEEN(B."TRDAT", CURRENT_DATE) <= 90
                AND A."SYNC_HEADER_ID" = ${hdrId}
                AND A."CUSTOMER_ID" = ${customer_id}
                AND B."SYNC_HEADER_ID" = ${hdrId}
                AND B."CUSTOMER_ID" = ${customer_id}
                AND D."SYNC_HEADER_ID" = ${hdrId}
                AND D."CUSTOMER_ID" = ${customer_id}
                GROUP BY 
                A."AGR_NAME",
                D."TEXT"
            ORDER BY 
                "USER COUNT" DESC
        ) AS subquery;
        `,
      );

      let topRolesBarChartData = [
        {
          name: "Top 10 Roles by active user assign", 
          assignedToY2: "off",
          displayInLegend: "auto",
          items: [],
        },
      ];

      getTopRolesByActiveUserCount.forEach((row, index) => {
        topRolesBarChartData[0].items.push({
          id: (index + 1).toString(),
          value: row["USER COUNT"],
          name: row["ROLE NAME"],
          labelPosition: "none",
        });
      });

      
      let getTopTransactionsByActiveUsers = await db.run(
        `
        SELECT TOP 5
        -- S.TRANSACTION_CODE AS "TRANSACTION CODE",
        T.TRANSACTION_TEXT AS "TRANSACTION TEXT",
        COUNT(S.USER) AS "EXECUTION COUNT"
        FROM 
        LO_USR02 U
        JOIN 
        LO_SM20 S
        ON 
        U.BNAME = S.USER
        JOIN
        LO_TSTCT T
        ON
        S.TRANSACTION_CODE = T.TCODE
        WHERE 
        U.UFLAG NOT IN (32, 64, 128)
        AND DAYS_BETWEEN(U.TRDAT, CURRENT_DATE) < 90
        AND S.TRANSACTION_CODE NOT IN ('S000', 'SESSION_MANAGER', 'null')
        AND S."SYNC_HEADER_ID" = ${hdrId}
        AND U."SYNC_HEADER_ID" = ${hdrId}
        AND T."SYNC_HEADER_ID" = ${hdrId}
        AND S."CUSTOMER_ID" = ${customer_id}
        AND U."CUSTOMER_ID" = ${customer_id}
        AND T."CUSTOMER_ID" = ${customer_id}
        GROUP BY 
        -- S.TRANSACTION_CODE,
        T.TRANSACTION_TEXT
        ORDER BY 
        "EXECUTION COUNT" DESC;
        `,
      );
      
      // let topTransactionchartData = {
      //   categories: getTopTransactionsByActiveUsers.map(
      //     (row) => row["TRANSACTION CODE"],
      //   ),
      //   series: [
      //     {
      //       name: "Top 5 Transactions by Active Users",
      //       data: getTopTransactionsByActiveUsers.map(
      //         (row) => row["USER COUNT"],
      //       ),
      //     },
      //   ],
      // };

      let topTransactionBarChartData = [
        {
          name: "Top 5 Transaction by active users execution time",
          assignedToY2: "off",
          displayInLegend: "auto",
          items: [],
        },
      ];

      getTopTransactionsByActiveUsers.forEach((row, index) => {
        topTransactionBarChartData[0].items.push({
          id: (index + 1).toString(),
          value: row["EXECUTION COUNT"],
          name: row["TRANSACTION TEXT"],
          labelPosition: "none",
        });
      });
      
      
      console.table(activeUserTypeData);
      console.table(activeUserRoleCountData);
      console.table(getTopRolesByActiveUserCount);
      console.table(getTopTransactionsByActiveUsers);
      console.log(JSON.stringify(topRolesBarChartData, null, 2));
      console.log(JSON.stringify(topTransactionBarChartData, null, 2));

      return {
        statuscode: HttpStatus.OK,
        message: "Data fetched successfully",
        data: {
          activeUserType: transformedActiveUserTypeData,
          activeUserRoleCount: transformedActiveUserRoleCountData,
          topRolesByActiveUserCount: getTopRolesByActiveUserCount,
          topTransactionsByActiveUsers: getTopTransactionsByActiveUsers,
          barChartTopRolesByActiveUserCount: topRolesBarChartData,
          barChartTopTransactionsByActiveUsers: topTransactionBarChartData,
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
        SELECT 
          subquery."USER_NAME",
          subquery."ANAME",
          subquery."CLASS",
          subquery."USTYP",
          subquery."DEPARTMENT",
          CONCAT(subquery."TRANSACTION NAME", ' : ') || subquery."TRANSACTION_CODE" AS "TRANSACTION_NAME",
          subquery."TRANSACTION_COUNT"
        FROM (
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
                      TRANSACTION_CODE NOT IN ('S000', 'SESSION_MANAGER', 'null')
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
                    TT."TRANSACTION_TEXT" AS "TRANSACTION NAME",
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
                JOIN
                  LO_TSTCT TT
                ON
                  RU."TRANSACTION_CODE" = TT."TCODE"
                WHERE
                  UADDR."SYNC_HEADER_ID" = ${hdrId}
                  AND UADDR."CUSTOMER_ID" = ${customer_id}
                  AND TT."SYNC_HEADER_ID" = ${hdrId}
                  AND TT."CUSTOMER_ID" = ${customer_id}
                    GROUP BY
                        -- AU."BNAME",
                        UADDR."NAME_TEXTC",
                        RU."TRANSACTION_CODE",
                        TT."TRANSACTION_TEXT",
                        AU."CLASS",
                        AU."USTYP",
                        AU."ANAME",
                        UADDR."DEPARTMENT"
                    ORDER BY
                        -- AU."BNAME",
                        UADDR."NAME_TEXTC",
                        "TRANSACTION_COUNT" DESC
        ) AS subquery
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
            TRANSACTION_NAME,
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
            [`TRANSACTION_CODE_${transactionIndex}`]: TRANSACTION_NAME,
            [`TRANSACTION_COUNT_${transactionIndex}`]: TRANSACTION_COUNT,
          });

          // Add bar chart item
          acc[USER_NAME].bar_chart[0].items.push({
            id: (acc[USER_NAME].bar_chart[0].items.length + 1).toString(),
            value: TRANSACTION_COUNT,
            name: TRANSACTION_NAME,
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
