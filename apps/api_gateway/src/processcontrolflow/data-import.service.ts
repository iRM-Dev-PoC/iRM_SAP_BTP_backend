import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import { Pool, Client } from "pg";
import * as xlsx from "xlsx";
import { Readable } from "stream";
import * as csv from "csv-parser";
import { join } from "path";
import  cds, { struct }  from "@sap/cds"; 
import { Any } from "typeorm";


type insertDataEmployee = {
  CLIENT:string;
  PERSONNEL_NUMBER:string;
  FIRST_NAME:string;
  END_DATE: string;
  START_DATE: string;
  LAST_NAME: string;
  DATE_OF_BIRTH:string;
  MIDDLE_NAME?: string; 
  ID_NUMBER:string;
  CREATED_BY:string;
  CREATED_ON:string;
}

type insertDataSalesOrder = {
  SALES_DOCUMENT: string;
  DOCUMENT_DATE: string;
  CREATED_BY: string;
  CREATED_ON: string;
  TIME: string;
  SOLD_TO_PARTY: string;
  NET_VALUE: string;
  SOLD_TO_PARTY_NAME: string;
  SALES_DOCUMENT_ITEM: string;
  MATERIAL_DESCRIPTION: string;
  PERSONNEL_NUMBER: string;
  SCHEDULE_LINE_NUMBER: string;
}

type insertDataBillingInvoice = {
  BILLING_DOCUMENT: string;
  SALES_DOCUMENT: string;
  PAYER_DESCRIPTION: string;
  ITEM_DESCRIPTION: string;
  BILLING_DATE: string;
  NET_VALUE: string;
  TAX_AMOUNT: string;
  COST: string;
  GRORSS_VALUE: string;
  SALES_DOCUMENT_ITEM: string;
  CREATED_BY: string;
  CREATED_ON: string;
  SUMOF_NET_GROSS_VALUE: string;
}

@Injectable()
export class DataImportService {
  constructor(private readonly pool: Pool) {}


  async handleFileUploads(files: Array<Express.Multer.File>) {
    for (const file of files) {
      const fileExtension = file.originalname.split(".").pop();
      const tempFilePath = join(process.cwd(), file.path);

      if (fileExtension === "csv") {
        await this.importCSVToTempTable(tempFilePath, '', '');
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        const csvPath = await this.convertExcelToCSV(tempFilePath);
        await this.importCSVToTempTable(csvPath, '', '');
        fs.unlinkSync(csvPath); // Remove the temporary CSV file
      } else {
        console.error(`Unsupported file format: ${fileExtension}`);
      }

      fs.unlinkSync(tempFilePath); // Remove the temporary file
    }

    await this.batchInsertIntoHANA();
  }

  async importCSVToTempTable(csvPath: string, syncID : String, fileName : String) {
    if (!fs.existsSync(csvPath) || !fs.lstatSync(csvPath).isFile()) {
      console.error(`File not found or not a regular file: ${csvPath}`);
      return;
    }

    try {

      // connect to hana
      const db = await cds.connect.to('db');

      const whereClause = cds.parse.expr(`SYNC_ID = '${syncID}'`);
  
      // get header id from sync_header table
      const syncHdrData = await db.read('PCF_DB_SYNC_HEADER').columns('ID').where(whereClause);
      
      const syncHdrId = syncHdrData[0].ID;
      console.log(`hdr ID : ${syncHdrId}`);
  
      const workbook = xlsx.readFile(csvPath);
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const fileNameUpper = fileName.toUpperCase(); 
      
      // batch insert into db
      if(fileNameUpper.includes('EMPLOYEE')) {

        // Convert sheet to JSON object
        const data: insertDataEmployee[] = xlsx.utils.sheet_to_json(sheet);

        // insert into sync_details
        const syncData = await INSERT.into('PCF_DB_SYNC_DETAILS').entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 1,
          REPORT_ID: 1,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: 'Initiated',
          CREATED_ON: `${new Date().toISOString()}`,
        });

        // change employee data format
        const insertData = data.map(item  => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            CLIENT: String(item.CLIENT),
            PERSONNEL_NUMBER: String(item.PERSONNEL_NUMBER),
            FIRST_NAME: String(item.FIRST_NAME),
            LAST_NAME: String(item.LAST_NAME),
            DATE_OF_BIRTH: String(item.DATE_OF_BIRTH),
            ID_NUMBER: String(item.ID_NUMBER),
            CREATED_BY: String(item.CREATED_BY),
            CREATED_ON: String(item.CREATED_ON),
            START_DATE: String(item.START_DATE),
            END_DATE: String(item.END_DATE),
            MIDDLE_NAME: String(item.MIDDLE_NAME),
          };
        });

        console.log('employee report');

        // insert into employee_master
        try {
          const insertRows = await INSERT(insertData).into('PA0002_EMPLOYEE_MASTER');

          // update sync_details status
          const updateStatus = await UPDATE('PCF_DB_SYNC_DETAILS').set({
            SYNC_STATUS: 'Completed',
            SYNC_ENDED_AT: `${new Date().toISOString()}`,
          }).where({
            SYNC_HEADER_ID: syncHdrId,
            REPORT_ID: 1,
          })

          // console.log('rows insert ', insertData);
        } catch(err) {
          // update sync_details status
          const updateStatus = await UPDATE('PCF_DB_SYNC_DETAILS').set({
            SYNC_STATUS: 'Error',
            SYNC_ENDED_AT: `${new Date().toISOString()}`,
          }).where({
            SYNC_HEADER_ID: syncHdrId,
            REPORT_ID: 1,
          });
          console.error('Can not insert rows! ', err)
        }

      } else if (fileNameUpper.includes('BILLING')) {
        // Convert sheet to JSON object
        const data: insertDataBillingInvoice[] = xlsx.utils.sheet_to_json(sheet);

        // insert into sync_details
        const syncData = await INSERT.into('PCF_DB_SYNC_DETAILS').entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 1,
          REPORT_ID: 2,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: 'Initiated',
          CREATED_ON: `${new Date().toISOString()}`,
        });

        // change billing data format
        const insertData = data.map(item  => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            BILLING_DOCUMENT: String(item.BILLING_DOCUMENT),
            SALES_DOCUMENT: String(item.SALES_DOCUMENT),
            PAYER_DESCRIPTION: String(item.PAYER_DESCRIPTION),
            ITEM_DESCRIPTION: String(item.ITEM_DESCRIPTION),
            BILLING_DATE: String(item.BILLING_DATE),
            NET_VALUE: String(item.NET_VALUE),
            TAX_AMOUNT: String(item.TAX_AMOUNT),
            COST: String(item.COST),
            GRORSS_VALUE: String(item.GRORSS_VALUE),
            SALES_DOCUMENT_ITEM: String(item.SALES_DOCUMENT_ITEM),
            CREATED_BY: String(item.CREATED_BY),
            CREATED_ON: String(item.CREATED_ON),
            SUMOF_NET_GROSS_VALUE: String(item.SUMOF_NET_GROSS_VALUE),
          };
        });

        console.log('billing report');

        // insert into billing_master
        try {
          const insertRows = await INSERT(insertData).into('ZSD0070_BILLING_REPORT');

          // update sync_details status
          const updateStatus = await UPDATE('PCF_DB_SYNC_DETAILS').set({
            SYNC_STATUS: 'Completed',
            SYNC_ENDED_AT: `${new Date().toISOString()}`,
          }).where({
            SYNC_HEADER_ID: syncHdrId,
            REPORT_ID: 2,
          })

          // console.log('rows insert ', insertData);
        } catch(err) {
          // update sync_details status
          const updateStatus = await UPDATE('PCF_DB_SYNC_DETAILS').set({
            SYNC_STATUS: 'Error',
            SYNC_ENDED_AT: `${new Date().toISOString()}`,
          }).where({
            SYNC_HEADER_ID: syncHdrId,
            REPORT_ID: 2,
          });
          console.error('Can not insert rows! ', err)
        }
      } else if (fileNameUpper.includes('SALES')) {

        // Convert sheet to JSON object
        const data: insertDataSalesOrder[] = xlsx.utils.sheet_to_json(sheet);

        // insert into sync_details
        const syncData = await INSERT.into('PCF_DB_SYNC_DETAILS').entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 1,
          REPORT_ID: 3,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: 'Initiated',
          CREATED_ON: `${new Date().toISOString()}`,
        });

        // change sales data format
        const insertData = data.map(item  => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            SALES_DOCUMENT: String(item.SALES_DOCUMENT),
            DOCUMENT_DATE: String(item.DOCUMENT_DATE),
            CREATED_BY: String(item.CREATED_BY),
            CREATED_ON: String(item.CREATED_ON),
            TIME: String(item.TIME),
            SOLD_TO_PARTY: String(item.SOLD_TO_PARTY),
            NET_VALUE: String(item.NET_VALUE),
            SOLD_TO_PARTY_NAME: String(item.SOLD_TO_PARTY_NAME),
            SALES_DOCUMENT_ITEM: String(item.SALES_DOCUMENT_ITEM),
            MATERIAL_DESCRIPTION: String(item.MATERIAL_DESCRIPTION),
            PERSONNEL_NUMBER: String(item.PERSONNEL_NUMBER),
            SCHEDULE_LINE_NUMBER: String(item.SCHEDULE_LINE_NUMBER),
          };
        });

        
        // console.log(insertData);
        console.log('sales report');
        // insert into sales_order
        try {
          const insertRows = await INSERT(insertData).into('VA05_SALES_ORDER');

          // update sync_details status
          const updateStatus = await UPDATE('PCF_DB_SYNC_DETAILS').set({
            SYNC_STATUS: 'Completed',
            SYNC_ENDED_AT: `${new Date().toISOString()}`,
          }).where({
            SYNC_HEADER_ID: syncHdrId,
            REPORT_ID: 3,
          });
          // console.log('rows insert ', insertData);
        } catch(err) {
          // update sync_details status
          const updateStatus = await UPDATE('PCF_DB_SYNC_DETAILS').set({
            SYNC_STATUS: 'Error',
            SYNC_ENDED_AT: `${new Date().toISOString()}`,
          }).where({
            SYNC_HEADER_ID: syncHdrId,
            REPORT_ID: 3,
          });
          console.error('Can not insert rows! ', err)
        }
      }



      /* Code commented, may required later */
      // get all reports from report_master
      // const query = `SELECT LOWER(REPORT_NAME) REPORT_NAME FROM PCF_DB_REPORT_MASTER`;
      // const allReports = await db.run(query);

      // let isReportPresent : Boolean = false;
      // allReports.forEach(element => {
      //   if(element.REPORT_NAME === fileName) {
      //     isReportPresent = true;
      //     return;
      //   } 
      // });


      // if(isReportPresent) {
      //   const workbook = xlsx.readFile(csvPath);
      //   // Get the first sheet
      //   const sheetName = workbook.SheetNames[0];
      //   const sheet = workbook.Sheets[sheetName];

      //   // Convert sheet to JSON object
      //   const data = xlsx.utils.sheet_to_json(sheet);

      //   console.log(data);
      // } else {
      //   console.log(`report not found`);
      // }
      /** Ended */


      
    } catch (err) {
      console.error("Error importing CSV data:", err);
    } finally {
      // await client.end(); 
    }
  }

  async convertExcelToCSV(excelPath: string): Promise<string> {
    const workbook = xlsx.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const csvData = xlsx.utils.sheet_to_csv(worksheet);
    const tempCsvPath = `${process.env.UPLOAD_DEST}/temp_${Date.now()}.csv`;
    fs.writeFileSync(tempCsvPath, csvData);
    return tempCsvPath;
  }

  async getCSVHeaders(csvPath: string): Promise<string[]> {
    const fileData = fs.readFileSync(csvPath, "utf8");
    const headers = fileData.split("\n")[0].split(",");
    return headers;
  }

  async getColumnTypes(csvPath: string, headers: string[]): Promise<string[]> {
    const fileData = fs.readFileSync(csvPath, "utf8");
    const rows = fileData.split("\n").slice(1, 11); // Get the first 10 rows after the header

    const columnTypes = headers.map((_, index) => {
      const values = rows.map((row) => row.split(",")[index]);
      const type = this.inferColumnType(values);
      return type;
    });

    return columnTypes;
  }

  inferColumnType(values: string[]): string {
    const numericValues = values.filter((value) => !isNaN(parseFloat(value)));
    const isNumeric = numericValues.length === values.length;

    if (isNumeric) {
      return "DOUBLE"; // Assume numeric values are double
    } else {
      const maxLength = Math.max(...values.map((value) => value.length));
      return `NVARCHAR(${maxLength})`;
    }
  }

  async batchInsertIntoHANA() {
    const client = await this.pool.connect();

    try {
      // Fetch data from the temporary or structured tables
      const data = await client.query("SELECT * FROM structured_table");

      // Perform batch insertion into the CDS table
      await cds.tx(async (transaction) => {
        const table = await cds.entities("your.namespace.YOUR_CDS_TABLE");
        for (const row of data.rows) {
          // await table.create(transaction, row);
        }
      });
    } catch (err) {
      console.error("Error performing batch insertion:", err);
    } finally {
      client.release();
    }
  }
}
