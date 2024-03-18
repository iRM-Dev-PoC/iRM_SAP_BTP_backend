import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';

@Injectable()
export class CSVService {
  async GetDataFromCSV(filepath: string, columns: string[]): Promise<any[]> {
    const data: any[] = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream('public/' + filepath)
        .pipe(csvParser())
        .on('data', (row) => {
          const filteredRow: any = {};
          for (const column of columns) {
            const columnName = column.trim().replaceAll('_', ' ').toLowerCase();
            if (row.hasOwnProperty(columnName)) {
              filteredRow[column.replaceAll(' ', '_').toUpperCase()] =
                row[columnName];
            } else {
              reject(new Error(`Column "${column}" not found in CSV file`));
              return; // Stop processing this row
            }
          }
          data.push(filteredRow);
        })
        .on('end', () => {
          resolve(data);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}
