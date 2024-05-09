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

      const controlOutData = result.map((item) => {
        return {
          ...item,
          SYNC_HEADER_ID: hdrId,
          CUSTOMER_ID: 1,
        };
      });

      // insert into out table
      const insertRows =
        await INSERT(controlOutData).into("PRICE_MISMATCH_OUT");

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
        message: "Data Simulated Successfully!",
      };
    } catch (error) {
      console.error(error);
      return {
        statuscode: HttpStatus.BAD_REQUEST,
        message:
          "Error in Data Simulation! - Please fill all the required field",
      };
    }
  }
}
