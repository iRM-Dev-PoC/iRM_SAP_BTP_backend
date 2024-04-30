import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import { Pool, Client } from "pg";
import * as xlsx from "xlsx";
import { Readable } from "stream";
import * as csv from "csv-parser";
import { join } from "path";
import  cds  from "@sap/cds"; 
import { Any } from "typeorm";


type insertData = {
  CLIENT:string;
  PERSONNEL_NUMBER:string;
  FIRST_NAME:string;
  END_DATE: string;
  START_DATE: string;
  LAST_NAME: string;
  DATE_OF_BIRTH:string;
  MIDDLE_NAME?: string; 
  ID_NUMBER:string;
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


      // Convert sheet to JSON object
      const data: insertData[] = xlsx.utils.sheet_to_json(sheet);
      
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
        };
      });

      console.log(insertData);

      const fileNameUpper = fileName.toUpperCase(); 

      // batch insert into db
      if(fileNameUpper.includes('EMPLOYEE')) {
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
        console.log('employee report');
        // insert into employee_master
        try {
          const insertRows = await INSERT(insertData).into('PA0002_EMPLOYEE_MASTER');
          // console.log('rows insert ', insertData);
        } catch(err) {
          console.error('Can not insert rows! ', err)
        }

      } else if (fileName.includes('BILLING')) {
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
        // insert into billing_master
      } else if (fileName.includes('SALES')) {
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
        // insert into sales_order_master
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
