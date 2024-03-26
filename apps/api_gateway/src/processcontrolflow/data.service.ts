import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

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
}
