import { Injectable, HttpStatus } from '@nestjs/common';
import { Pool } from 'pg';
import cds from "@sap/cds";

@Injectable()
export class DataService {
  constructor(private readonly pool: Pool) {}

  async processAndStoreTempTableData() {
    const client = await this.pool.connect();

    try {
      // Create permanent tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS employee_master (
          client TEXT,
          personnel_number TEXT,
          emp_name TEXT,
          start_date DATE,
          end_date DATE,
          end_year INT
        );

        CREATE TABLE IF NOT EXISTS unique_users (
          personnel_number TEXT,
          emp_name TEXT
        );

        CREATE TABLE IF NOT EXISTS billing_sales_data (
          cnt INT,
          billing_document TEXT,
          b_sls_doc TEXT,
          sls_doc TEXT,
          billing_invoice_net_value NUMERIC,
          sales_order_net_value NUMERIC
        );

        CREATE TABLE IF NOT EXISTS single_billing_data (
          cnt INT,
          billing_document TEXT,
          sales_document TEXT,
          net_value NUMERIC
        );

        CREATE TABLE IF NOT EXISTS sales_order_data (
          sales_document TEXT,
          sold_to_party_name TEXT,
          sales_document_item TEXT,
          net_value_grp TEXT,
          schedule_line_number TEXT,
          formatted_delivery_date TEXT
        );
      `);

      // Execute SQL queries and store results in permanent tables
      await client.query(`
        INSERT INTO employee_master
        SELECT * FROM public."EmployeeMaster";
      `);

      await client.query(`
        INSERT INTO unique_users
        SELECT unq_users."Personnel Number", unq_users.emp_name
        FROM (
          SELECT emp_mst."Client", emp_mst."Personnel Number", CONCAT(emp_mst."First name", ' ', COALESCE(emp_mst."Middle name", ''), ' ', emp_mst."Last name") AS emp_name, TO_DATE(emp_mst."Start Date"::text, 'YYYYMMDD') AS start_date, TO_DATE(emp_mst."End Date"::text, 'YYYYMMDD') AS formatted_end_date, EXTRACT(YEAR FROM TO_DATE(emp_mst."End Date"::text, 'YYYYMMDD')) AS end_year
          FROM "EmployeeMaster" emp_mst
        ) unq_users
        WHERE end_year = 9999 AND emp_name IS NOT NULL;
      `);

      await client.query(`
        INSERT INTO billing_sales_data
        SELECT cnt, billing_document, tbl_billing.sales_document AS b_sls_doc, tbl_sales.sales_document AS sls_doc, tbl_billing.billing_invoice_net_value, tbl_sales.sales_order_net_value
        FROM (
          SELECT COUNT(id) AS cnt, "Billing_Document" AS billing_document, "Sales_Document" AS sales_document, "Sales_Document_Item" AS sales_document_item, "Net_Value" AS billing_invoice_net_value
          FROM public."Billing_Report"
          GROUP BY "Billing_Document", "Sales_Document", "Sales_Document_Item", "Net_Value"
        ) AS tbl_billing
        INNER JOIN (
          SELECT "Sales_Document" AS sales_document, "Sold_to_Party_Name" AS sold_to_party_name, "Net_Value" AS sales_order_net_value
          FROM public."Sales_Order"
          WHERE "Sales_Document" IN (
            SELECT "Sales_Document"
            FROM public."Sales_Order"
            GROUP BY "Sales_Document"
            HAVING COUNT("Sales_Document") = 1
          )
        ) AS tbl_sales
        ON tbl_billing.sales_document = tbl_sales.sales_document;
      `);

      await client.query(`
        INSERT INTO single_billing_data
        SELECT cnt, billing_document, sales_document, net_value
        FROM (
          SELECT COUNT(id) AS cnt, "Billing_Document" AS billing_document, "Sales_Document" AS sales_document, "Net_Value" AS net_value
          FROM public."Billing_Report"
          GROUP BY "Billing_Document", "Sales_Document", "Sales_Document_Item", "Net_Value"
        ) tbl
        WHERE cnt = 1;
      `);

      await client.query(`
        INSERT INTO sales_order_data
        SELECT sales_document, sold_to_party_name, sales_document_item, net_value_grp, schedule_line_number, formatted_delivery_date
        FROM (
          SELECT COUNT(id) AS cnt, "Sales_Document" AS sales_document, "Sales_Document_Item" AS sales_document_item, STRING_AGG("Net_Value", ', ') AS net_value_grp, "Schedule_Line_Number" AS schedule_line_number, TO_CHAR(TO_DATE("Document_Date", 'YYYYMMDD'), 'DD-MM-YYYY') AS formatted_delivery_date, "Sold_to_Party_Name" AS sold_to_party_name
          FROM public."Sales_Order"
          GROUP BY "Sales_Document", "Sales_Document_Item", "Schedule_Line_Number", "Document_Date", "Sold_to_Party_Name"
        ) tbl
        WHERE cnt = 1;
      `);
    } catch (err) {
      console.error('Error processing temporary table data:', err);
    } finally {
      client.release();
    }
  }


  async dataSimulation(hdrId : number) : Promise<any>{
    const db = await cds.connect.to('db');

    // const query = `SELECT unq_users.personnel_number, unq_users.emp_name 
    //   FROM (
    //       SELECT
    //           emp_mst.ID,
    //           emp_mst.personnel_number, 
    //           CONCAT(CONCAT(CONCAT(CONCAT(emp_mst.first_name,' '), emp_mst.middle_name), ' '), emp_mst.last_name) AS emp_name, 
    //           emp_mst.start_date, 
    //           TO_VARCHAR(TO_DATE(emp_mst.end_date, 'YYYYMMDD'), 'DD-MM-YYYY') AS formatted_end_date,
    //           TO_VARCHAR(TO_DATE(emp_mst.end_date, 'YYYYMMDD'), 'YYYY') AS end_year
    //       FROM pa0002_employee_master emp_mst where sync_header_id = ${hdrId}
    //   ) AS unq_users 
    //   WHERE end_year = '9999' AND emp_name IS NOT NULL;`;


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
              tbl_sales_order.sales_personnel_number,
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
                      personnel_number as sales_personnel_number,
                      created_on sales_order_created_on
                  FROM 
                      va05_sales_order where sync_header_id = ${hdrId}
              ) AS tbl_sales_order 
          ON tbl_billing.sales_document = tbl_sales_order.sales_document
          INNER JOIN PA0002_EMPLOYEE_MASTER on PA0002_EMPLOYEE_MASTER.personnel_number = tbl_sales_order.sales_personnel_number and sync_header_id = ${hdrId}
        ) tbl
        where billing_invoice_net_value != sales_order_net_value;
      `;
    
    try {
      const result = await db.run(simulationQuery);
      
      console.log(result);

      const controlOutData = result.map(item => {
        return {
          ...item,
          SYNC_HEADER_ID:hdrId,
          CUSTOMER_ID: 1
        }
      });

      // insert into out table
      const insertRows = await INSERT(controlOutData).into('PRICE_MISMATCH_OUT');
      
      // update the simulation in sync_header table
      const updateHeader = await UPDATE("PCF_DB_SYNC_HEADER")
        .set({
          IS_SIMULATED: true,
        })
        .where({
          ID: hdrId,
        });

      return {
        statuscode: HttpStatus.OK,
        message: 'Data Simulated Successfully!',
      };
    } catch (error) {
      console.error(error); 
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error in Data Simulation!',
      };
    }

  }
}
