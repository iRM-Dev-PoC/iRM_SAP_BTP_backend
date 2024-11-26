import { ResponseDto } from "@app/share_lib/common.dto";
import { Injectable } from "@nestjs/common";
import cds from "@sap/cds";
import * as fs from "fs";
import * as xlsx from "xlsx";
import {
  AGR_1251_Dto,
  AGR_USERS_Dto,
  SM20_Dto,
  USR02_Dto,
  USER_ADDR_Dto,
  TSTCT_Dto,
  AGR_DEFINE_Dto,
} from "./dto/dataload.dto";
import { STATUS_CODES } from "http";

@Injectable()
export class DataImportService {
  async importCSVToTempTable(
    csvPath: string,
    syncID: String,
    fileName: String,
  ): Promise<ResponseDto> {
    {
      if (!fs.existsSync(csvPath) || !fs.lstatSync(csvPath).isFile()) {
        console.error(`File not found or not a regular file: ${csvPath}`);
        return;
      }

      try {
        const db = await cds.connect.to("db");

        const whereClause = cds.parse.expr(`SYNC_ID = '${syncID}'`);

        // get header id from sync_header table
        const syncHdrData = await db
          .read("LO_SYNC_HEADER")
          .columns("ID")
          .where(whereClause);

        const syncHdrId = syncHdrData[0].ID;

        const workbook = xlsx.readFile(csvPath);
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        function excelSerialToDate(serial) {
          if (!serial) return null; // Return null for empty or invalid input
          const excelEpoch = new Date(1899, 11, 30); // Excel's epoch date
          const date = new Date(excelEpoch.getTime() + (serial - 1) * 86400000);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        }

        function excelSerialToTime(serial) {
          if (!serial && serial !== 0) return null; // Return null for empty or invalid input
          const totalSeconds = Math.floor(serial * 86400); // 86400 seconds in a day
          const hours = String(Math.floor(totalSeconds / 3600)).padStart(
            2,
            "0",
          );
          const minutes = String(
            Math.floor((totalSeconds % 3600) / 60),
          ).padStart(2, "0");
          const seconds = String(totalSeconds % 60).padStart(2, "0");
          return `${hours}:${minutes}:${seconds}`;
        }

        const fileNameUpper = fileName.toUpperCase();

        // batch insert into db
        if (fileNameUpper.includes("USR02")) {
          const data: USR02_Dto[] = xlsx.utils.sheet_to_json(sheet);

          const syncData = await INSERT.into("LO_SYNC_DETAILS").entries({
            SYNC_HEADER_ID: syncHdrId,
            REPORT_ID: 1,
            SYNC_STARTED_AT: `${new Date().toISOString()}`,
            CREATED_BY: `1`,
            SYNC_STATUS: "Initiated",
            CREATED_ON: `${new Date().toISOString()}`,
          });

          const insertData = data.map((item) => {
            return {
              SYNC_HEADER_ID: syncHdrId,
              CUSTOMER_ID: 1,
              BNAME: String(item.BNAME || null),
              GLTGV: excelSerialToDate(item.GLTGV),
              GLTGB: excelSerialToDate(item.GLTGB),
              USTYP: String(item.USTYP || null),
              CLASS: String(item.CLASS || null),
              UFLAG: Number(item.UFLAG || null),
              ACCNT: String(item.ACCNT || null),
              ANAME: String(item.ANAME || null),
              ERDAT: excelSerialToDate(item.ERDAT),
              TRDAT: excelSerialToDate(item.TRDAT),
              LTIME: excelSerialToTime(item.LTIME),
              TZONE: String(item.TZONE || null),
            };
          });

          try {
            const insertRows = await INSERT(insertData).into("LO_USR02");

            // update sync_details status
            const updateStatus = await UPDATE("LO_SYNC_DETAILS")
              .set({
                SYNC_STATUS: "Completed",
                SYNC_ENDED_AT: `${new Date().toISOString()}`,
              })
              .where({
                SYNC_HEADER_ID: syncHdrId,
                REPORT_ID: 1,
              });
          } catch (err) {
            // update sync_details status
            const updateStatus = await UPDATE("LO_SYNC_DETAILS")
              .set({
                SYNC_STATUS: "Error",
                SYNC_ENDED_AT: `${new Date().toISOString()}`,
              })
              .where({
                SYNC_HEADER_ID: syncHdrId,
                REPORT_ID: 1,
              });
            console.error("Can not insert rows! ", err);
          }
        } else if (fileNameUpper.includes("AGR_USERS")) {
          const data: AGR_USERS_Dto[] = xlsx.utils.sheet_to_json(sheet);

          const syncData = await INSERT.into("LO_SYNC_DETAILS").entries({
            SYNC_HEADER_ID: syncHdrId,
            REPORT_ID: 2,
            SYNC_STARTED_AT: `${new Date().toISOString()}`,
            CREATED_BY: `1`,
            SYNC_STATUS: "Initiated",
            CREATED_ON: `${new Date().toISOString()}`,
          });

          const insertData = data.map((item) => {
            return {
              SYNC_HEADER_ID: syncHdrId,
              CUSTOMER_ID: 1,
              AGR_NAME: String(item.AGR_NAME || null),
              UNAME: String(item.UNAME || null),
              FROM_DAT: excelSerialToDate(item.FROM_DAT),
              TO_DAT: excelSerialToDate(item.TO_DAT),
            };
          });

          try {
            const insertRows = await INSERT(insertData).into("LO_AGR_USERS");

            // update sync_details status
            const updateStatus = await UPDATE("LO_SYNC_DETAILS")
              .set({
                SYNC_STATUS: "Completed",
                SYNC_ENDED_AT: `${new Date().toISOString()}`,
              })
              .where({
                SYNC_HEADER_ID: syncHdrId,
                REPORT_ID: 2,
              });
          } catch (err) {
            // update sync_details status
            const updateStatus = await UPDATE("LO_SYNC_DETAILS")
              .set({
                SYNC_STATUS: "Error",
                SYNC_ENDED_AT: `${new Date().toISOString()}`,
              })
              .where({
                SYNC_HEADER_ID: syncHdrId,
                REPORT_ID: 2,
              });
            console.error("Can not insert rows! ", err);
          }
        } else if (fileNameUpper.includes("SM20")) {
          const data: SM20_Dto[] = xlsx.utils.sheet_to_json(sheet);

          const syncData = await INSERT.into("LO_SYNC_DETAILS").entries({
            SYNC_HEADER_ID: syncHdrId,
            REPORT_ID: 3,
            SYNC_STARTED_AT: `${new Date().toISOString()}`,
            CREATED_BY: `1`,
            SYNC_STATUS: "Initiated",
            CREATED_ON: `${new Date().toISOString()}`,
          });

          const insertData = data.map((item) => {
            return {
              SYNC_HEADER_ID: syncHdrId,
              CUSTOMER_ID: 1,
              DATE: excelSerialToDate(item.DATE),
              TIME: String(item.TIME || null),
              USER: String(item.USER || null),
              TERMINAL_NAME: String(item.TERMINAL_NAME || null),
              TRANSACTION_CODE: String(item.TRANSACTION_CODE || null),
              PROGRAM: String(item.PROGRAM || null),
              MESSAGE_TEXT: String(item.MESSAGE_TEXT || null),
            };
          });

          try {
            const insertRows = await INSERT(insertData).into("LO_SM20");

            // update sync_details status
            const updateStatus = await UPDATE("LO_SYNC_DETAILS")
              .set({
                SYNC_STATUS: "Completed",
                SYNC_ENDED_AT: `${new Date().toISOString()}`,
              })
              .where({
                SYNC_HEADER_ID: syncHdrId,
                REPORT_ID: 3,
              });
          } catch (err) {
            // update sync_details status
            const updateStatus = await UPDATE("LO_SYNC_DETAILS")
              .set({
                SYNC_STATUS: "Error",
                SYNC_ENDED_AT: `${new Date().toISOString()}`,
              })
              .where({
                SYNC_HEADER_ID: syncHdrId,
                REPORT_ID: 3,
              });
            console.error("Can not insert rows! ", err);
          }
        } else if (fileNameUpper.includes("AGR_1251")) {
          const data: AGR_1251_Dto[] = xlsx.utils.sheet_to_json(sheet);

          const syncData = await INSERT.into("LO_SYNC_DETAILS").entries({
            SYNC_HEADER_ID: syncHdrId,
            REPORT_ID: 4,
            SYNC_STARTED_AT: `${new Date().toISOString()}`,
            CREATED_BY: `1`,
            SYNC_STATUS: "Initiated",
            CREATED_ON: `${new Date().toISOString()}`,
          });

          const insertData = data.map((item) => {
            return {
              SYNC_HEADER_ID: syncHdrId,
              CUSTOMER_ID: 1,
              AGR_NAME: String(item.AGR_NAME || null),
              OBJECT: String(item.OBJECT || null),
              AUTH: String(item.AUTH || null),
              FIELD: String(item.FIELD || null),
              LOW: String(item.LOW || null),
              HIGH: String(item.HIGH || null),
            };
          });

          try {
            const insertRows = await INSERT(insertData).into("LO_AGR_1251");

            // update sync_details status
            const updateStatus = await UPDATE("LO_SYNC_DETAILS")
              .set({
                SYNC_STATUS: "Completed",
                SYNC_ENDED_AT: `${new Date().toISOString()}`,
              })
              .where({
                SYNC_HEADER_ID: syncHdrId,
                REPORT_ID: 4,
              });
          } catch (err) {
            // update sync_details status
            const updateStatus = await UPDATE("LO_SYNC_DETAILS")
              .set({
                SYNC_STATUS: "Error",
                SYNC_ENDED_AT: `${new Date().toISOString()}`,
              })
              .where({
                SYNC_HEADER_ID: syncHdrId,
                REPORT_ID: 4,
              });
            console.error("Can not insert rows! ", err);
          }
        } else if (fileNameUpper.includes("USER_ADDR")) {
          const data: USER_ADDR_Dto[] = xlsx.utils.sheet_to_json(sheet);

          const syncData = await INSERT.into("LO_SYNC_DETAILS").entries({
            SYNC_HEADER_ID: syncHdrId,
            REPORT_ID: 5,
            SYNC_STARTED_AT: `${new Date().toISOString()}`,
            CREATED_BY: `1`,
            SYNC_STATUS: "Initiated",
            CREATED_ON: `${new Date().toISOString()}`,
          });

          const insertData = data.map((item) => {
            return {
              SYNC_HEADER_ID: syncHdrId,
              CUSTOMER_ID: 1,
              BNAME: String(item.BNAME || null),
              NAME_FIRST: String(item.NAME_FIRST || null),
              NAME_LAST: String(item.NAME_LAST || null),
              NAME_TEXTC: String(item.NAME_TEXTC || null),
              DEPARTMENT: String(item.DEPARTMENT || null),
            };
          });

          try {
            const insertRows = await INSERT(insertData).into("LO_USER_ADDR");

            // update sync_details status
            const updateStatus = await UPDATE("LO_SYNC_DETAILS")
              .set({
                SYNC_STATUS: "Completed",
                SYNC_ENDED_AT: `${new Date().toISOString()}`,
              })
              .where({
                SYNC_HEADER_ID: syncHdrId,
                REPORT_ID: 5,
              });
          } catch (err) {
            // update sync_details status
            const updateStatus = await UPDATE("LO_SYNC_DETAILS")
              .set({
                SYNC_STATUS: "Error",
                SYNC_ENDED_AT: `${new Date().toISOString()}`,
              })
              .where({
                SYNC_HEADER_ID: syncHdrId,
                REPORT_ID: 5,
              });
            console.error("Can not insert rows! ", err);
          }
        } else if (fileNameUpper.includes("TSTCT")) {
          const data: TSTCT_Dto[] = xlsx.utils.sheet_to_json(sheet);

          const syncData = await INSERT.into("LO_SYNC_DETAILS").entries({
            SYNC_HEADER_ID: syncHdrId,
            REPORT_ID: 6,
            SYNC_STARTED_AT: `${new Date().toISOString()}`,
            CREATED_BY: `1`,
            SYNC_STATUS: "Initiated",
            CREATED_ON: `${new Date().toISOString()}`,
          });

          const insertData = data.map((item) => {
            return {
              SYNC_HEADER_ID: syncHdrId,
              CUSTOMER_ID: 1,
              TCODE: String(item.TCODE || null),
              TRANSACTION_TEXT: String(item.TRANSACTION_TEXT || null),
            };
          });

          try {
            const insertRows = await INSERT(insertData).into("LO_TSTCT");

            // update sync_details status
            const updateStatus = await UPDATE("LO_SYNC_DETAILS")
              .set({
                SYNC_STATUS: "Completed",
                SYNC_ENDED_AT: `${new Date().toISOString()}`,
              })
              .where({
                SYNC_HEADER_ID: syncHdrId,
                REPORT_ID: 6,
              });
          } catch (err) {
            // update sync_details status
            const updateStatus = await UPDATE("LO_SYNC_DETAILS")
              .set({
                SYNC_STATUS: "Error",
                SYNC_ENDED_AT: `${new Date().toISOString()}`,
              })
              .where({
                SYNC_HEADER_ID: syncHdrId,
                REPORT_ID: 6,
              });
            console.error("Can not insert rows! ", err);
          }
        } else if (fileNameUpper.includes("AGR_DEFINE")) {
          const data: AGR_DEFINE_Dto[] = xlsx.utils.sheet_to_json(sheet);

          const syncData = await INSERT.into("LO_SYNC_DETAILS").entries({
            SYNC_HEADER_ID: syncHdrId,
            REPORT_ID: 7,
            SYNC_STARTED_AT: `${new Date().toISOString()}`,
            CREATED_BY: `1`,
            SYNC_STATUS: "Initiated",
            CREATED_ON: `${new Date().toISOString()}`,
          });

          const insertData = data.map((item) => {
            return {
              SYNC_HEADER_ID: syncHdrId,
              CUSTOMER_ID: 1,
              AGR_NAME: String(item.AGR_NAME || null),
              PARENT_AGR: String(item.PARENT_AGR || null),
              TEXT: String(item.TEXT || null),
            };
          });

          try {
            const insertRows = await INSERT(insertData).into("LO_AGR_DEFINE");

            // update sync_details status
            const updateStatus = await UPDATE("LO_SYNC_DETAILS")
              .set({
                SYNC_STATUS: "Completed",
                SYNC_ENDED_AT: `${new Date().toISOString()}`,
              })
              .where({
                SYNC_HEADER_ID: syncHdrId,
                REPORT_ID: 7,
              });
          } catch (err) {
            // update sync_details status
            const updateStatus = await UPDATE("LO_SYNC_DETAILS")
              .set({
                SYNC_STATUS: "Error",
                SYNC_ENDED_AT: `${new Date().toISOString()}`,
              })
              .where({
                SYNC_HEADER_ID: syncHdrId,
                REPORT_ID: 7,
              });
            console.error("Can not insert rows! ", err);
          }
        } else {
          throw new Error("Unknown File Name");
        }
        const syncEndedAt = await UPDATE("LO_SYNC_HEADER")
          .set({
            SYNC_ENDED_AT: `${new Date().toISOString()}`,
          })
          .where(`ID = ${syncHdrId}`);
      } catch (err) {
        console.error("Error importing CSV data:", err);
      }
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
}
