import { HttpStatus, Injectable } from "@nestjs/common";
import cds from "@sap/cds";

@Injectable()
export class DataService {
  async dataSimulation(hdrId: number): Promise<any> {
    const db = await cds.connect.to("db");

    const simulationQuery = `
      SELECT tbl.*
        FROM (
          SELECT 
              tbl_billing.billing_document, 
              tbl_billing.sales_document,
              tbl_billing.billing_tax_amount,
              tbl_billing.billing_cost,
              tbl_billing.net_value AS billing_invoice_net_value, 
              tbl_sales_order.net_value AS sales_order_net_value ,
              tbl_sales_order.sales_personal_number,
              tbl_sales_order.sold_to_party_name,
              tbl_billing.item_description,
              tbl_billing.payer_description,
              CONCAT(CONCAT(CONCAT(CONCAT(PA0002_EMPLOYEE_MASTER.first_name, ' '), PA0002_EMPLOYEE_MASTER.middle_name), ' '), PA0002_EMPLOYEE_MASTER.last_name) employee_name,
              tbl_sales_order.sales_order_created_on,
              tbl_billing.billing_created_on
          FROM (
              SELECT 
                  ID, 
                  billing_document, 
                  sales_document, 
                  sales_document_item, 
                  net_value AS net_value,
                  tax_amount billing_tax_amount,
                  cost billing_cost,
                  item_description,
                  payer_description,
                  created_on billing_created_on
              FROM 
                  zsd0070_billing_report where sync_header_id = ${hdrId}
            ) AS tbl_billing 
          INNER JOIN (
                  SELECT 
                      ID, 
                      sales_document, 
                      sales_document_item, 
                      net_value, 
                      schedule_line_number,
                      sold_to_party_name,
                      personal_number as sales_personal_number,
                      created_on sales_order_created_on
                  FROM 
                      va05_sales_order where sync_header_id = ${hdrId}
              ) AS tbl_sales_order 
          ON tbl_billing.sales_document = tbl_sales_order.sales_document
          INNER JOIN PA0002_EMPLOYEE_MASTER on PA0002_EMPLOYEE_MASTER.personal_number = tbl_sales_order.sales_personal_number and sync_header_id = ${hdrId}
        ) tbl
        where billing_invoice_net_value != sales_order_net_value;
      `;

    const simulationQuery2 = `
      SELECT 
          EKKO.PURCHASING_DOCUMENT,
          EKPO.PURCHASE_REQUISITION,
          EKKO.DOCUMENT_DATE,
          EKKO.CREATED_ON,
          EKKO.CREATED_BY,
          EKPO.MATERIAL,
          EKPO.COMPANY_CODE,
          EKPO.PLANT,
          EKPO.STORAGE_LOCATION,
          EKPO.MATERIAL_GROUP
      FROM 
          "39131F99F8F44FB4A0F0F6D759497FF7"."EKKO" EKKO
      JOIN 
          "39131F99F8F44FB4A0F0F6D759497FF7"."EKPO" EKPO
      ON 
          EKKO.PURCHASING_DOCUMENT = EKPO.PURCHASING_DOCUMENT
          AND EKPO.SYNC_HEADER_ID = ${hdrId}
          AND EKKO.SYNC_HEADER_ID = ${hdrId}
      WHERE 
          EKPO.PURCHASE_REQUISITION = 'undefined';
    `;

    const simulationQuery3 = `
      WITH DUPLICATE_SALES_ORDERS AS (
        SELECT SALES_DOCUMENT
        FROM "39131F99F8F44FB4A0F0F6D759497FF7"."VBAK"
        WHERE SYNC_HEADER_ID = ${hdrId}
        GROUP BY SALES_DOCUMENT
        HAVING COUNT(*) > 1
      )
      SELECT V.*
      FROM "39131F99F8F44FB4A0F0F6D759497FF7"."VBAK" V 
      INNER JOIN DUPLICATE_SALES_ORDERS DSO ON V.SALES_DOCUMENT = DSO.SALES_DOCUMENT
      AND V.SYNC_HEADER_ID = ${hdrId}
      ORDER BY V.SALES_DOCUMENT
    `;

    const simulationQuery4 = `
      SELECT
        P.SYNC_HEADER_ID,
        P.CUSTOMER_ID,
        P.PURCHASING_DOCUMENT, 
        P.COMPANY_CODE, 
        P.CREATED_ON AS PO_CREATED_ON, 
        P.CREATED_BY AS PO_CREATED_BY, 
        P.VENDOR, 
        P.TERMS_OF_PAYMENT AS PO_PAYMENT_TERM, 
        V.NAME_OF_VENDOR, 
        V.STREET, 
        V.CITY, 
        V.ACCOUNT_GROUP, 
        V.TERMS_OF_PAYMENT AS VENDOR_PAYMENT_TERM
      FROM 
          "39131F99F8F44FB4A0F0F6D759497FF7"."ME2L" P
      INNER JOIN 
          "39131F99F8F44FB4A0F0F6D759497FF7"."MKVZ" V 
      ON 
          P.VENDOR = V.VENDOR
          AND V.SYNC_HEADER_ID = ${hdrId}
          AND P.SYNC_HEADER_ID = ${hdrId}
      WHERE 
          P.TERMS_OF_PAYMENT <> V.TERMS_OF_PAYMENT 
    `;

    const simulationQuery5 = `
      WITH DuplicateCustomers AS (
        SELECT 
            CUSTOMER
        FROM 
            KNB1
        WHERE KNB1.SYNC_HEADER_ID = ${hdrId}
        GROUP BY 
            CUSTOMER
        HAVING 
            COUNT(*) > 1
      )
      SELECT 
          KNB1.CUSTOMER, 
          KNB1.COMPANY_CODE, 
          KNB1.CREATED_ON, 
          KNB1.CREATED_BY,
          KNA1.COUNTRY, 
          KNA1.NAME1, 
          KNA1.CITY, 
          KNA1.POSTAL_CODE, 
          KNA1.REGION, 
          KNA1.STREET, 
          KNA1.TELEPHONE1
      FROM 
          KNB1
      JOIN 
          KNA1 ON KNB1.CUSTOMER = KNA1.CUSTOMER AND KNB1.SYNC_HEADER_ID = ${hdrId}
      WHERE 
          KNB1.CUSTOMER IN (SELECT CUSTOMER FROM DuplicateCustomers); 
    `;

    const simulationQuery6 = `
      WITH VendorMultipleBankAccounts AS (
        SELECT Vendor
        FROM LFBK
        WHERE SYNC_HEADER_ID = ${hdrId}
        GROUP BY Vendor
        HAVING COUNT(DISTINCT Bank_Account) > 1
      )
      SELECT lbk.Vendor,
      lbk.country,
      lbk.bank_key,
      lbk.bank_account,
      lbk.ACCOUNT_HOLDER
      FROM LFBK lbk
      INNER JOIN VendorMultipleBankAccounts vmba ON lbk.Vendor = vmba.Vendor AND lbk.SYNC_HEADER_ID = ${hdrId}; 
    `;

    const simulationQuery7 = `
      SELECT 
        COALESCE(lfa1.Vendor, lfbk.Vendor) AS Vendor,
        lfa1.Country AS Country_LFA1,
        lfbk.Country AS Country_LFBK,
        lfa1.Name1 AS Name1_LFA1,
        lfbk.Account_Holder AS Account_Holder_LFBK,
        lfa1.City AS City_LFA1,
        lfa1.Telephone1 AS Telephone1_LFA1,
        lfbk.Bank_Account AS Bank_Account_LFBK,
        CASE 
            WHEN lfa1.Vendor IS NULL THEN 'Missing in LFBK'
            WHEN lfbk.Vendor IS NULL THEN 'Missing in LFA1'
            WHEN lfa1.Country <> lfbk.Country 
                OR lfa1.Name1 <> lfbk.Account_Holder 
                OR lfa1.City <> lfbk.Bank_Account THEN 'Discrepancy'
            ELSE 'Match'
        END AS Issue_Type
      FROM 
          LFA1 lfa1
      FULL OUTER JOIN 
          LFBK lfbk 
      ON 
          lfa1.Vendor = lfbk.Vendor
          AND lfa1.SYNC_HEADER_ID = ${hdrId} AND lfbk.SYNC_HEADER_ID = ${hdrId};
    `;

    /*
    -- Step 1: Identify customers without credit limits
WITH CustomersWithoutCreditLimits AS (
    SELECT kna1.CUSTOMER
    FROM KNA1 kna1
    LEFT JOIN KNKK knkk ON kna1.CUSTOMER = knkk.Customer
    WHERE knkk.Customer IS NULL
)

-- Step 2: Fetch additional details
SELECT
    kna1.CUSTOMER,
    kna1.COUNTRY,
    kna1.NAME1,
    kna1.CITY,
    kna1.POSTAL_CODE,
    kna1.REGION,
    kna1.STREET,
    kna1.TELEPHONE1,
    knb1.COMPANY_CODE,
    knb1.CREATED_ON,
    knb1.CREATED_BY
FROM CustomersWithoutCreditLimits cwc
JOIN KNA1 kna1 ON cwc.CUSTOMER = kna1.CUSTOMER
LEFT JOIN KNB1 knb1 ON cwc.CUSTOMER = knb1.CUSTOMER;
*/

    try {
      // Price Mismatch
      const result = await db.run(simulationQuery);

      const controlOutData = result.map((item) => ({
        ...item,
        SYNC_HEADER_ID: hdrId,
        CUSTOMER_ID: 1,
      }));

      // Insert into out table
      const insertRows = await cds.run(
        INSERT.into("PRICE_MISMATCH_OUT").entries(controlOutData),
      );

      // Manual PO Without PR Requisition
      const result2 = await db.run(simulationQuery2);

      const controlOutData2 = result2.map((item) => ({
        ...item,
        SYNC_HEADER_ID: hdrId,
        CUSTOMER_ID: 1,
      }));

      // Insert into out table
      const insertRows2 = await cds.run(
        INSERT.into("MANUAL_PO_WITHOUT_PR_REFERENCE").entries(controlOutData2),
      );

      // Duplicate Sales Order
      const result3 = await db.run(simulationQuery3);

      const controlOutData3 = result3.map((item) => {
        const { ID, ...rest } = item; // Exclude the ID column
        return {
          ...rest,
          SYNC_HEADER_ID: hdrId,
          CUSTOMER_ID: 1,
        };
      });

      // Insert into out table
      const insertRows3 = await cds.run(
        INSERT.into("DUPLICATE_SALES_ORDER").entries(controlOutData3),
      );

      // Mismatch in Payment Terms
      const result4 = await db.run(simulationQuery4);

      const controlOutData4 = result4.map((item) => ({
        ...item,
        SYNC_HEADER_ID: hdrId,
        CUSTOMER_ID: 1,
      }));

      // Insert into out table
      const insertRows4 = await cds.run(
        INSERT.into("MISMATCH_IN_PAYMENT_TERMS").entries(controlOutData4),
      );

      // DUPLICATE_CREDIT_CUSTOMER_CODES
      const result5 = await db.run(simulationQuery5);

      const controlOutData5 = result5.map((item) => ({
        ...item,
        SYNC_HEADER_ID: hdrId,
        CUSTOMER_ID: 1,
      }));

      // Insert into out table
      const insertRows5 = await cds.run(
        INSERT.into("DUPLICATE_CREDIT_CUSTOMER_CODES").entries(controlOutData5),
      );

      // MULTIPLE BANK ACCOUNT AGAINST SAME VENDOR CODE
      const result6 = await db.run(simulationQuery6);

      const controlOutData6 = result6.map((item) => ({
        ...item,
        SYNC_HEADER_ID: hdrId,
        CUSTOMER_ID: 1,
      }));

      // Insert into out table
      const insertRows6 = await cds.run(
        INSERT.into("MULTIPLE_BANK_ACCOUNTS_VENDOR").entries(controlOutData6),
      );

      // INCOMPLETE VENDOR MASTER
      const result7 = await db.run(simulationQuery7);

      const controlOutData7 = result7.map((item) => ({
        ...item,
        SYNC_HEADER_ID: hdrId,
        CUSTOMER_ID: 1,
      }));

      // Insert into out table
      const insertRows7 = await cds.run(
        INSERT.into("INCOMPLETE_VENDOR_MASTER").entries(controlOutData7),
      );

      // Update the simulation in sync_header table
      await cds.run(
        UPDATE("PCF_DB_SYNC_HEADER")
          .set({ IS_SIMULATED: true })
          .where({ ID: hdrId }),
      );

      return {
        statusCode: HttpStatus.OK,
        message: "Data Simulated Successfully!",
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          "Error in Data Simulation! - Please fill all the required fields",
      };
    }
  }
}
