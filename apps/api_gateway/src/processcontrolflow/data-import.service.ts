import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Pool, Client } from 'pg';
import * as xlsx from 'xlsx';
import { Readable } from 'stream';
import * as csv from 'csv-parser';

@Injectable()
export class DataImportService {
  constructor(private readonly pool: Pool) {}

  // async importCSVToTempTable(csvPath: string) {
  //   if (!fs.existsSync(csvPath) || !fs.lstatSync(csvPath).isFile()) {
  //     console.error(`File not found or not a regular file: ${csvPath}`);
  //     return;
  //   }

  //   const client = await this.pool.connect();

  //   try {
  //     await client.query('CREATE TEMPORARY TABLE temp_table (data TEXT)');

  //     const stream = fs.createReadStream(csvPath);
  //     if (!stream) {
  //       throw new Error(`Failed to create read stream for file: ${csvPath}`);
  //     }

  //     const query = `COPY temp_table (data) FROM STDIN WITH (FORMAT CSV, HEADER TRUE)`;
  //     const copyStream = client.query(new Readable().wrap(stream), query);

  //     stream.on('error', (err) => {
  //       console.error('Error reading stream:', err);
  //       copyStream.stream.destroy();
  //     });

  //     copyStream.stream.on('error', (err) => {
  //       console.error('Error copying data:', err);
  //     });

  //     stream.pipe(copyStream.stream);

  //     await new Promise((resolve, reject) => {
  //       copyStream.stream.on('end', resolve);
  //       copyStream.stream.on('error', reject);
  //     });

  //     const headers = await this.getCSVHeaders(csvPath);
  //     const columnDefinitions = headers
  //       .map((header, index) => `col${index + 1} TEXT`)
  //       .join(', ');

  //     await client.query(
  //       `CREATE TEMPORARY TABLE structured_table (${columnDefinitions})`,
  //     );

  //     const insertQuery = `
  //     INSERT INTO structured_table (${headers
  //       .map((_, index) => `col${index + 1}`)
  //       .join(', ')})
  //     SELECT ${headers
  //       .map((_, index) => `split_part(data, ',', ${index + 1})`)
  //       .join(', ')}
  //     FROM temp_table
  //   `;

  //     await client.query(insertQuery);
  //   } catch (err) {
  //     console.error('Error importing CSV data:', err);
  //   } finally {
  //     client.release();
  //   }
  // }

  // async importCSVToTempTable(csvPath: string) {
  //   if (!fs.existsSync(csvPath) || !fs.lstatSync(csvPath).isFile()) {
  //     console.error(`File not found or not a regular file: ${csvPath}`);
  //     return;
  //   }

  //   const client = await this.pool.connect();

  //   try {
  //     await client.query('CREATE TEMPORARY TABLE temp_table (data TEXT)');

  //     const stream = fs.createReadStream(csvPath);
  //     const headers = await this.getCSVHeaders(csvPath);

  //     const columnDefinitions = headers
  //       .map((header, index) => `col${index + 1} TEXT`)
  //       .join(', ');

  //     await client.query(
  //       `CREATE TEMPORARY TABLE structured_table (${columnDefinitions})`,
  //     );

  //     const insertQuery = `
  //     INSERT INTO structured_table (${headers
  //       .map((_, index) => `col${index + 1}`)
  //       .join(', ')})
  //     VALUES ($1, $2, $3, ...)
  //   `;

  //     const parser = stream.pipe(csv());
  //     for await (const record of parser) {
  //       const values = headers.map((header) => record[header]);
  //       const placeholders = values
  //         .map((_, index) => `$${index + 1}`)
  //         .join(', ');
  //       const query = {
  //         text: insertQuery.replace('$1, $2, $3, ...', placeholders),
  //         values,
  //       };
  //       await client.query(query);
  //     }
  //   } catch (err) {
  //     console.error('Error importing CSV data:', err);
  //   } finally {
  //     client.release();
  //   }
  // }

  // async importCSVToTempTable(csvPath: string) {
  //   if (!fs.existsSync(csvPath) || !fs.lstatSync(csvPath).isFile()) {
  //     console.error(`File not found or not a regular file: ${csvPath}`);
  //     return;
  //   }

  //   const client = await this.pool.connect();

  //   try {
  //     const stream = fs.createReadStream(csvPath);
  //     const parser = stream.pipe(csv());
  //     const headers = await this.getCSVHeaders(csvPath);

  //     const columnDefinitions = headers
  //       .map((header, index) => `col${index + 1} TEXT`)
  //       .join(', ');

  //     await client.query(
  //       `CREATE TEMPORARY TABLE structured_table (${columnDefinitions})`,
  //     );

  //     const insertQuery = `
  //     INSERT INTO structured_table (${headers.join(', ')})
  //     VALUES ($1, $2, $3, ...)
  //   `;

  //     for await (const record of parser) {
  //       const values = headers.map((header) => record[header]);
  //       await client.query(insertQuery, values);
  //     }
  //   } catch (err) {
  //     console.error('Error importing CSV data:', err);
  //   } finally {
  //     client.release();
  //   }
  // }

  // async importCSVToTempTable(csvPath: string) {
  //   if (!fs.existsSync(csvPath) || !fs.lstatSync(csvPath).isFile()) {
  //     console.error(`File not found or not a regular file: ${csvPath}`);
  //     return;
  //   }

  //   const client = await this.pool.connect();

  //   try {
  //     const stream = fs.createReadStream(csvPath);
  //     const parser = stream.pipe(csv());
  //     const headers = await this.getCSVHeaders(csvPath);

  //     const columnDefinitions = headers
  //       .map((header, index) => `"col${index + 1}" TEXT`)
  //       .join(', ');

  //     await client.query(
  //       `CREATE TEMPORARY TABLE structured_table (${columnDefinitions})`,
  //     );

  //     const insertQuery = `
  //       INSERT INTO structured_table (${headers.map((header) => `"${header}"`).join(', ')})
  //       VALUES (${headers.map((_, index) => `$${index + 1}`).join(', ')})
  //     `;

  //     for await (const record of parser) {
  //       const values = headers.map((header) => record[header]);
  //       await client.query(insertQuery, values);
  //     }
  //   } catch (err) {
  //     console.error('Error importing CSV data:', err);
  //   } finally {
  //     client.release();
  //   }
  // }

  // async importCSVToTempTable(csvPath: string) {
  //   if (!fs.existsSync(csvPath) || !fs.lstatSync(csvPath).isFile()) {
  //     console.error(`File not found or not a regular file: ${csvPath}`);
  //     return;
  //   }

  //   const client = await this.pool.connect();

  //   try {
  //     // Check if the temporary table already exists
  //     const tableExists = await this.checkIfTableExists(
  //       client,
  //       'structured_table',
  //     );
  //     if (!tableExists) {
  //       // Create the temporary table if it doesn't exist
  //       await this.createStructuredTable(client);
  //     }

  //     // Read CSV file and insert data into the temporary table
  //     const stream = fs.createReadStream(csvPath);
  //     const parser = stream.pipe(csv());
  //     for await (const record of parser) {
  //       const values = Object.values(record);
  //       await client.query(
  //         `INSERT INTO structured_table VALUES (${values.map((_, index) => `$${index + 1}`).join(', ')})`,
  //         values,
  //       );
  //     }
  //   } catch (err) {
  //     console.error('Error importing CSV data:', err);
  //   } finally {
  //     client.release();
  //   }
  // }

  // async importCSVToTempTable(csvPath: string) {
  //   if (!fs.existsSync(csvPath) || !fs.lstatSync(csvPath).isFile()) {
  //     console.error(`File not found or not a regular file: ${csvPath}`);
  //     return;
  //   }

  //   const client = await this.pool.connect();

  //   try {
  //     // Check if the temporary table already exists
  //     const tableExists = await this.checkIfTableExists(
  //       client,
  //       'structured_table',
  //     );
  //     if (!tableExists) {
  //       // Create the temporary table if it doesn't exist
  //       await this.createStructuredTable(client);
  //     }

  //     // Read CSV file and insert data into the temporary table
  //     const stream = fs.createReadStream(csvPath);
  //     const parser = stream.pipe(csv());
  //     for await (const record of parser) {
  //       const columns = Object.keys(record).join(', ');
  //       const placeholders = Object.values(record)
  //         .map((_, index) => `$${index + 1}`)
  //         .join(', ');
  //       const values = Object.values(record);
  //       const insertQuery = `INSERT INTO structured_table (${columns}) VALUES (${placeholders})`;
  //       await client.query(insertQuery, values);
  //     }
  //   } catch (err) {
  //     console.error('Error importing CSV data:', err);
  //   } finally {
  //     client.release();
  //   }
  // }

  // async checkIfTableExists(client, tableName: string) {
  //   const res = await client.query(
  //     `SELECT EXISTS (SELECT FROM pg_catalog.pg_class WHERE relname = '${tableName}' AND relkind = 'r')`,
  //   );
  //   return res.rows[0].exists;
  // }

  // async createStructuredTable(client) {
  //   await client.query(
  //     `CREATE TEMPORARY TABLE structured_table (Client TEXT, Personnel_Number TEXT, ... )`,
  //   );
  // }

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
