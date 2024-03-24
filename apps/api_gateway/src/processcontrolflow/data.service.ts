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

      // Additional INSERT statements...
    } catch (err) {
      console.error('Error processing temporary table data:', err);
    } finally {
      client.release();
    }
  }
}
