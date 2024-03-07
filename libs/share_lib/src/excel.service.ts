import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

@Injectable()
export class ExcelService {
  async GetDataFromExcel(filepath: string, columns: string[]): Promise<any[]> {
    const workbook = XLSX.readFile('public/' + filepath);
    const sheet_name_list = workbook.SheetNames;
    const worksheet = workbook.Sheets[sheet_name_list[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let actualcolumns = [];
    for (const element of columns) {
      actualcolumns.push(element.replaceAll('_', ' ').toLowerCase());
    }
    const filteredData = data.map((obj: any) => {
      const filteredKeys = Object.keys(obj).filter((key) =>
        actualcolumns.includes(key.toLowerCase()),
      );
      return filteredKeys.reduce(
        (acc, key) => ({
          ...acc,
          [key.replaceAll(' ', '_').toUpperCase()]: obj[key],
        }),
        {},
      );
    });

    return filteredData;
  }
}
