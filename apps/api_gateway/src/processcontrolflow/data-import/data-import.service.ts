// data-import.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Pool } from 'pg';
import * as xlsx from 'xlsx';
import { Readable } from 'stream';

@Injectable()
export class DataImportService {
  async importCSVToTempTable(csvPath: string, pool: Pool) {
    if (!fs.existsSync(csvPath)) {
      console.error(`File not found: ${csvPath}`);
      return;
    }

    const client = await pool.connect();

    try {
      // Create a temporary table
      await client.query('CREATE TEMPORARY TABLE temp_table (data TEXT)');

      // Import CSV data into the temporary table
      const stream = fs.createReadStream(csvPath);
      if (!stream) {
        console.error('Error: Unable to create read stream for CSV file');
        return;
      }

      const query = `
        COPY temp_table (data)
        FROM STDIN
        WITH (FORMAT CSV, HEADER TRUE)
      `;
      const copyStream = client.query(new Readable().wrap(stream), query);
      const pipeStream = stream.pipe(copyStream.stream);

      await new Promise((resolve, reject) => {
        copyStream.stream.on('error', reject);
        copyStream.stream.on('end', resolve);
        pipeStream.on('error', reject);
      });

      // Create a structured table with columns based on the CSV headers
      const headers = await this.getCSVHeaders(csvPath);
      const columnDefinitions = headers
        .map((header, index) => `col${index + 1} TEXT`)
        .join(', ');
      await client.query(`
        CREATE TEMPORARY TABLE structured_table (${columnDefinitions})
      `);
      await client.query(`
        INSERT INTO structured_table (${headers.map((_, index) => `col${index + 1}`).join(', ')})
        SELECT ${headers.map((_, index) => `split_part(data, ',', ${index + 1})`).join(', ')}
        FROM temp_table
      `);
    } catch (err) {
      console.error('Error importing CSV data:', err);
    } finally {
      client.release();
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
