import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import { Pool, Client } from "pg";
import * as xlsx from "xlsx";
import { Readable } from "stream";
import * as csv from "csv-parser";
import { join } from "path";
import  cds  from "@sap/cds"; 


@Injectable()
export class DataImportService {
  constructor(private readonly pool: Pool) {}


  async handleFileUploads(files: Array<Express.Multer.File>) {
    for (const file of files) {
      const fileExtension = file.originalname.split(".").pop();
      const tempFilePath = join(process.cwd(), file.path);

      if (fileExtension === "csv") {
        await this.importCSVToTempTable(tempFilePath, '');
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        const csvPath = await this.convertExcelToCSV(tempFilePath);
        await this.importCSVToTempTable(csvPath, '');
        fs.unlinkSync(csvPath); // Remove the temporary CSV file
      } else {
        console.error(`Unsupported file format: ${fileExtension}`);
      }

      fs.unlinkSync(tempFilePath); // Remove the temporary file
    }

    await this.batchInsertIntoHANA();
  }

  async importCSVToTempTable(csvPath: string, syncID : String) {
    if (!fs.existsSync(csvPath) || !fs.lstatSync(csvPath).isFile()) {
      console.error(`File not found or not a regular file: ${csvPath}`);
      return;
    }

    // connect to hana
    const db = await cds.connect.to('db');

    // get header id from sync_header table
    const syncHdrData = await db.read('PCF_DB_SYNC_HEADER').where({ SYNC_ID: syncID });
    
    const syncHdrId = syncHdrData[0].ID;
    console.log(`hdr ID : ${syncHdrId}`);

    // insert into sync_details
    const syncData = await INSERT.into('PCF_DB_SYNC_DETAILS').entries({
      SYNC_HEADER_ID: syncHdrId,
      CONTROL_ID: 1,
      REPORT_ID: 1,
      SYNC_STARTED_AT: `${new Date().toISOString()}`,
      CREATED_BY: `1`,
      CREATED_ON: `${new Date().toISOString()}`,
    });
  
    try {
      // const stream = fs.createReadStream(csvPath);
      // const parser = stream.pipe(csv());
      // const headers: string[] = await this.getCSVHeaders(csvPath);
      
      // Read the Excel file
      const workbook = xlsx.readFile(csvPath);

      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON object
      const data = xlsx.utils.sheet_to_json(sheet);
      
      // for await (const record of parser) {
      //   const values = headers.map((header) => record[header]);
      //   console.log(values);
      //   await client.query(insertQuery, values);
      // }

      console.log(data);

      // const insertedRows = await INSERT.into()

      // await client.query("CREATE TEMPORARY TABLE temp_table (data TEXT)");


      // const columnTypes = await this.getColumnTypes(csvPath, headers);

      // const cdsColumnDefinitions = headers
      //   .map((header, index) => `${header} ${columnTypes[index]}`)
      //   .join(", ");

      // const temporaryColumnDefinitions = headers
      //   .map((header, index) => `col${index + 1} TEXT`)
      //   .join(", ");

      // await client.query(
      //   `CREATE TEMPORARY TABLE structured_table (${temporaryColumnDefinitions})`,
      // );

      // const insertQuery = `
      //   INSERT INTO structured_table (${headers.map((_, index) => `col${index + 1}`).join(", ")})
      //   VALUES (${headers.map((_, index) => `$${index + 1}`).join(", ")})
      // `;

      // const parser = stream.pipe(csv());
      // for await (const record of parser) {
      //   const values = headers.map((header) => record[header]);
      //   await client.query(insertQuery, values);
      // }
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
