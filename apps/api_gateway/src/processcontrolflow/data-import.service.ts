import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Pool, Client } from 'pg';
import * as xlsx from 'xlsx';
import { Readable } from 'stream';
import * as csv from 'csv-parser';

@Injectable()
export class DataImportService {
  constructor(private readonly pool: Pool) {}

  async importCSVToTempTable(csvPath: string) {
    if (!fs.existsSync(csvPath) || !fs.lstatSync(csvPath).isFile()) {
      console.error(`File not found or not a regular file: ${csvPath}`);
      return;
    }

    const client: Client = new Client(); // Create a new client instance
    await client.connect(); // Connect to the PostgreSQL database

    try {
      await client.query('CREATE TEMPORARY TABLE temp_table (data TEXT)');

      const stream = fs.createReadStream(csvPath);
      const headers: string[] = await this.getCSVHeaders(csvPath);

      const columnDefinitions = headers
        .map((header, index) => `col${index + 1} TEXT`)
        .join(', ');

      await client.query(
        `CREATE TEMPORARY TABLE structured_table (${columnDefinitions})`,
      );

      const insertQuery = `
        INSERT INTO structured_table (${headers.map((_, index) => `col${index + 1}`).join(', ')})
        VALUES (${headers.map((_, index) => `$${index + 1}`).join(', ')})
      `;

      const parser = stream.pipe(csv());
      for await (const record of parser) {
        const values = headers.map((header) => record[header]);
        await client.query(insertQuery, values);
      }
    } catch (err) {
      console.error('Error importing CSV data:', err);
    } finally {
      await client.end(); // Close the client connection
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
    const fileData = fs.readFileSync(csvPath, 'utf8');
    const headers = fileData.split('\n')[0].split(',');
    return headers;
  }
}
