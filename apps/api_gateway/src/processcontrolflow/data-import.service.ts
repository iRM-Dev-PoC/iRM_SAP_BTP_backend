import { Injectable } from "@nestjs/common";
import cds from "@sap/cds";
import * as fs from "fs";
import { join } from "path";
import * as xlsx from "xlsx";

type insertDataPA0002 = {
  CLIENT: string | null;
  PERSONAL_NUMBER: string | null;
  FIRST_NAME: string | null;
  END_DATE: string | null;
  START_DATE: string | null;
  LAST_NAME: string | null;
  DATE_OF_BIRTH: string | null;
  MIDDLE_NAME: string | null;
  ID_NUMBER: string | null;
  CREATED_BY: string | null;
  CREATED_ON: string | null;
};

type insertDataVA05 = {
  SALES_DOCUMENT: string | null;
  DOCUMENT_DATE: string | null;
  CREATED_BY: string | null;
  CREATED_ON: string | null;
  TIME: string | null;
  SOLD_TO_PARTY: string | null;
  NET_VALUE: string | null;
  SOLD_TO_PARTY_NAME: string;
  SALES_DOCUMENT_ITEM: string;
  MATERIAL_DESCRIPTION: string;
  PERSONAL_NUMBER: string;
  SCHEDULE_LINE_NUMBER: string;
};

type insertDataZSD0070 = {
  BILLING_DOCUMENT: string | null;
  SALES_DOCUMENT: string | null;
  PAYER_DESCRIPTION: string | null;
  ITEM_DESCRIPTION: string | null;
  BILLING_DATE: string | null;
  NET_VALUE: string | null;
  TAX_AMOUNT: string | null;
  COST: string | null;
  GRORSS_VALUE: string | null;
  SALES_DOCUMENT_ITEM: string | null;
  CREATED_BY: string | null;
  CREATED_ON: string | null;
  SUMOF_NET_GROSS_VALUE: string | null;
};

type insertDataEKKO = {
  PURCHASING_DOCUMENT: string | null;
  CREATED_ON: string | null;
  CREATED_BY: string | null;
  DOCUMENT_DATE: string | null;
  VENDOR: string | null;
  RELEASE_INDICATOR: string | null;
};

type insertDataEKPO = {
  PURCHASING_DOCUMENT: string | null;
  MATERIAL: string | null;
  COMPANY_CODE: string | null;
  PLANT: string | null;
  STORAGE_LOCATION: string | null;
  MATERIAL_GROUP: string | null;
  PURCHASE_REQUISITION: string | null;
  DELETION_INDICATOR: string | null;
  DELIVERY_COMPLETED: string | null;
};

type insertDataVBAK = {
  SALES_DOCUMENT: string | null;
  CREATED_ON: string | null;
  TIME: string | null;
  CREATED_BY: string | null;
  DOCUMENT_DATE: string | null;
  NET_VALUE: string | null;
  PURCHASE_ORDER_NO: string | null;
  PURCHASE_ORDER_DATE: string | null;
  TELEPHONE: string | null;
  SOLD_TO_PARTY: string | null;
};

type insertDataME2L = {
  PURCHASING_DOCUMENT: string | null;
  COMPANY_CODE: string | null;
  CREATED_ON: string | null;
  CREATED_BY: string | null;
  VENDOR: string | null;
  TERMS_OF_PAYMENT: string | null;
  DOCUMENT_DATE: string | null;
};

type insertDataMKVZ = {
  NAME_OF_VENDOR: string | null;
  STREET: string | null;
  CITY: string | null;
  ACCOUNT_GROUP: string | null;
  TERMS_OF_PAYMENT: string | null;
  VENDOR: string | null;
};

type insertDataKNA1 = {
  CUSTOMER: string | null;
  COUNTRY: string | null;
  NAME1: string | null;
  CITY: string | null;
  POSTAL_CODE: string | null;
  REGION: string | null;
  STREET: string | null;
  TELEPHONE1: string | null;
};

type insertDataKNB1 = {
  CUSTOMER: string | null;
  COMPANY_CODE: string | null;
  CREATED_ON: string | null;
  CREATED_BY: string | null;
  TERMS_OF_PAYMENT: string | null;
};

type insertDataLFBK = {
  VENDOR: string | null;
  COUNTRY: string | null;
  BANK_KEY: string | null;
  BANK_ACCOUNT: string | null;
  ACCOUNT_HOLDER: string | null;
};

type insertDataLFA1 = {
  VENDOR: string | null;
  COUNTRY: string | null;
  NAME1: string | null;
  CITY: string | null;
  POSTAL_CODE: string | null;
  REGION: string | null;
  TELEPHONE1: string | null;
  CENTRAL_POSTING_BLOCK: string | null;
  CENTRAL_PURCHASING_BLOCK: string | null;
};

type insertDataKNKK = {
  CUSTOMER: string | null;
  CREDIT_CONTROL_AREA: string | null;
  CREDIT_LIMIT: string | null;
};

type insertDataMAKT = {
  MATERIAL: string | null;
  LANGUAGE_KEY: string | null;
  MATERIAL_DESCRIPTION: string | null;
};

type insertDataMARA = {
  MATERIAL: string | null;
  CREATED_ON: string | null;
  CREATED_BY: string | null;
  MATERIAL_TYPE: string | null;
  MATERIAL_GROUP: string | null;
  EAN_UPC: string | null;
  MATERIAL_DESCRIPTION: string | null;
};

type insertDataEKBE = {
  PURCHASING_DOCUMENT: string | null;
  ITEM: string | null;
  MATERIAL_DESCRIPTION: string | null;
  INVOICE_VALUE: string | null;
  MATERIAL: string | null;
  PLANT: string | null;
  DOCUMENT_DATE: string | null;
  CREATED_BY: string | null;
  QUANTITY: string | null;
};

type insertDataVBUK = {
  SALES_DOCUMENT: string | null;
  DELIVERY_STATUS: string | null;
  OVERALL_DLV_STATUS: string | null;
};

type insertDataFBL1N = {
  COMPANY_CODE: string | null;
  VENDOR: string | null;
  VENDOR_NAME: string | null;
  REFERENCE: string | null;
  DOCUMENT_DATE: string;
  POSTING_DATE: string;
  NET_DUE_DATE: string;
  DOCUMENT_NUMBER: string | null;
  ENTRY_DATE: string;
  USER_NAME: string | null;
  PURCHASING_DOCUMENT: string | null;
  INVOICE_REFERENCE: string | null;
  CLEARING_DOCUMENT: string | null;
  ACCOUNT: string | null;
  CLEARING_DATE: string;
  AMOUNT_IN_LOCAL_CURRENCY: string | null;
};

type insertDataFBL5N = {
  USER_NAME: string | null;
  ACCOUNT: string | null;
  DOCUMENT_NUMBER: string | null;
  POSTING_DATE: string;
  COMPANY_CODE: string | null;
  LINE_ITEM: string | null;
  AMOUNT_IN_LOCAL_CURRENCY: string | null;
  TERMS_OF_PAYMENT: string | null;
};

type insertDataEBAN = {
  PURCHASING_REQUISITION: string | null;
  PROCESSING_STATUS: string | null;
  MATERIAL: string | null;
  REQUISITION_DATE: string;
  VALUATION_PRICE: string | null;
};

type insertDataCDPOS = {
  CHANGE_DOCUMENT_OBJECT: string | null;
  OBJECT_VALUE: string | null;
  DOCUMENT_NUMBER: string | null;
  TABLE_NAME: string | null;
  FIELD_NAME: string | null;
  NEW_VALUE: string | null;
  OLD_VALUE: string | null;
};

type insertDataCDHDR = {
  CHANGE_DOCUMENT_OBJECT: string | null;
  OBJECT_VALUE: string | null;
  DOCUMENT_NUMBER: string | null;
  USER: string | null;
  DATE: string;
  TIME: string;
};

type insertDataEKET = {
  PURCHASING_DOCUMENT: string | null;
  ITEM: string | null;
  SCHEDULED_QUANTITY: string | null;
  QUANTITY_DELIVERED: string | null;
  DELIVERY_DATE: string;
};

type insertDataANLA = {
  COMPANY_CODE: string | null;
  ASSET: string | null;
  SUB_NUMBER: string | null;
  ASSET_CLASS: string | null;
  CREATED_BY: string | null;
  CREATED_ON: string | null;
  ASSET_DESCRIPTION: string | null;
};

type insertDataANLB = {
  COMPANY_CODE: string | null;
  ASSET: string | null;
  SUB_NUMBER: string | null;
  CREATED_BY: string | null;
  CREATED_ON: string | null;
  USEFUL_LIFE: string | null;
};

type insertDataANLZ = {
  COMPANY_CODE: string | null;
  ASSET: string | null;
  SUB_NUMBER: string | null;
  VALID_TO: string | null;
  VALID_FROM: string | null;
  COST_CENTER: string | null;
  PLANT: string | null;
  LOCATION: string | null;
};

@Injectable()
export class DataImportService {
  async handleFileUploads(files: Array<Express.Multer.File>) {
    for (const file of files) {
      const fileExtension = file.originalname.split(".").pop();
      const tempFilePath = join(process.cwd(), file.path);

      if (fileExtension === "csv") {
        await this.importCSVToTempTable(tempFilePath, "", "");
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        const csvPath = await this.convertExcelToCSV(tempFilePath);
        await this.importCSVToTempTable(csvPath, "", "");
        fs.unlinkSync(csvPath); // Remove the temporary CSV file
      } else {
        console.error(`Unsupported file format: ${fileExtension}`);
      }

      fs.unlinkSync(tempFilePath); // Remove the temporary file
    }
  }

  async importCSVToTempTable(
    csvPath: string,
    syncID: String,
    fileName: String,
  ) {
    if (!fs.existsSync(csvPath) || !fs.lstatSync(csvPath).isFile()) {
      console.error(`File not found or not a regular file: ${csvPath}`);
      return;
    }

    try {
      // connect to hana
      const db = await cds.connect.to("db");

      const whereClause = cds.parse.expr(`SYNC_ID = '${syncID}'`);

      // get header id from sync_header table
      const syncHdrData = await db
        .read("PCF_DB_SYNC_HEADER")
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
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
          2,
          "0",
        );
        const seconds = String(totalSeconds % 60).padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
      }

      const fileNameUpper = fileName.toUpperCase();

      // batch insert into db
      if (fileNameUpper.includes("PA0002")) {
        // Convert sheet to JSON object
        const data: insertDataPA0002[] = xlsx.utils.sheet_to_json(sheet);

        // insert into sync_details
        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 1,
          REPORT_ID: 1,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });

        // change employee data format
        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            CLIENT: String(item.CLIENT),
            PERSONAL_NUMBER: String(item.PERSONAL_NUMBER),
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

        // insert into employee_master
        try {
          const insertRows = await INSERT(insertData).into("PA0002");

          // update sync_details status
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
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
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
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
      } else if (fileNameUpper.includes("ZSD0070")) {
        const data: insertDataZSD0070[] = xlsx.utils.sheet_to_json(sheet);

        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 1,
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

        try {
          const insertRows = await INSERT(insertData).into("ZSD0070");

          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 2,
            });
        } catch (err) {
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
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
      } else if (fileNameUpper.includes("VA05")) {
        const data: insertDataVA05[] = xlsx.utils.sheet_to_json(sheet);

        // insert into sync_details
        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 1,
          REPORT_ID: 3,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });

        // change sales data format
        const insertData = data.map((item) => {
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
            PERSONAL_NUMBER: String(item.PERSONAL_NUMBER),
            SCHEDULE_LINE_NUMBER: String(item.SCHEDULE_LINE_NUMBER),
          };
        });

        try {
          const insertRows = await INSERT(insertData).into("VA05");

          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
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
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
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
      } else if (fileNameUpper.includes("EKKO")) {
        // Convert sheet to JSON object
        const data: insertDataEKKO[] = xlsx.utils.sheet_to_json(sheet);

        // insert into sync_details
        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 2,
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
            PURCHASING_DOCUMENT: String(item.PURCHASING_DOCUMENT || null),
            CREATED_ON: excelSerialToDate(item.CREATED_ON),
            CREATED_BY: String(item.CREATED_BY || null),
            DOCUMENT_DATE: excelSerialToDate(item.DOCUMENT_DATE),
            VENDOR: String(item.VENDOR || null),
            RELEASE_INDICATOR: String(item.RELEASE_INDICATOR || null),
          };
        });

        // insert into EKKO
        try {
          const insertRows = await INSERT(insertData).into("EKKO");

          // update sync_details status
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
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
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
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
      } else if (fileNameUpper.includes("EKPO")) {
        // Convert sheet to JSON object
        const data: insertDataEKPO[] = xlsx.utils.sheet_to_json(sheet);

        // insert into sync_details
        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 2,
          REPORT_ID: 5,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });
        // change EKPO data format

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            PURCHASING_DOCUMENT: String(item.PURCHASING_DOCUMENT || null),
            MATERIAL: String(item.MATERIAL || null),
            COMPANY_CODE: String(item.COMPANY_CODE || null),
            PLANT: String(item.PLANT || null),
            STORAGE_LOCATION: String(item.STORAGE_LOCATION || null),
            MATERIAL_GROUP: String(item.MATERIAL_GROUP || null),
            PURCHASE_REQUISITION: String(item.PURCHASE_REQUISITION || null),
            DELETION_INDICATOR: String(item.DELETION_INDICATOR || null),
            DELIVERY_COMPLETED: String(item.DELIVERY_COMPLETED || null),
          };
        });

        // insert into EKPO
        try {
          const insertRows = await INSERT(insertData).into("EKPO");

          // update sync_details status
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
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
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
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
      } else if (fileNameUpper.includes("VBAK")) {
        const data: insertDataVBAK[] = xlsx.utils.sheet_to_json(sheet);

        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 1,
          REPORT_ID: 6,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });
        // change VBAK data format

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            SALES_DOCUMENT: String(item.SALES_DOCUMENT),
            CREATED_ON: excelSerialToDate(item.CREATED_ON),
            TIME: excelSerialToTime(item.TIME),
            CREATED_BY: String(item.CREATED_BY),
            DOCUMENT_DATE: excelSerialToDate(item.DOCUMENT_DATE),
            NET_VALUE: String(item.NET_VALUE),
            PURCHASE_ORDER_NO: String(item.PURCHASE_ORDER_NO),
            PURCHASE_ORDER_DATE: String(item.PURCHASE_ORDER_DATE),
            TELEPHONE: String(item.TELEPHONE),
            SOLD_TO_PARTY: String(item.SOLD_TO_PARTY),
          };
        });

        // insert into VBAK
        try {
          const insertRows = await INSERT(insertData).into("VBAK");

          // update sync_details status
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
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
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
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
      } else if (fileNameUpper.includes("ME2L")) {
        // Convert sheet to JSON object
        const data: insertDataME2L[] = xlsx.utils.sheet_to_json(sheet);

        // insert into sync_details
        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 2,
          REPORT_ID: 7,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });
        // change EKPO data format

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            PURCHASING_DOCUMENT: String(item.PURCHASING_DOCUMENT),
            COMPANY_CODE: String(item.COMPANY_CODE),
            CREATED_ON: String(item.CREATED_ON),
            CREATED_BY: String(item.CREATED_BY),
            VENDOR: String(item.VENDOR),
            TERMS_OF_PAYMENT: String(item.TERMS_OF_PAYMENT),
            DOCUMENT_DATE: String(item.DOCUMENT_DATE),
          };
        });

        // insert into EKPO
        try {
          const insertRows = await INSERT(insertData).into("ME2L");

          // update sync_details status
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
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
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
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
      } else if (fileNameUpper.includes("MKVZ")) {
        // Convert sheet to JSON object
        const data: insertDataMKVZ[] = xlsx.utils.sheet_to_json(sheet);

        // insert into sync_details
        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 2,
          REPORT_ID: 8,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });
        // change EKPO data format

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            NAME_OF_VENDOR: String(item.NAME_OF_VENDOR),
            STREET: String(item.STREET),
            CITY: String(item.CITY),
            ACCOUNT_GROUP: String(item.ACCOUNT_GROUP),
            TERMS_OF_PAYMENT: String(item.TERMS_OF_PAYMENT),
            VENDOR: String(item.VENDOR),
          };
        });

        // insert into EKPO
        try {
          const insertRows = await INSERT(insertData).into("MKVZ");

          // update sync_details status
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 8,
            });
        } catch (err) {
          // update sync_details status
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 8,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("KNA1")) {
        // Convert sheet to JSON object
        const data: insertDataKNA1[] = xlsx.utils.sheet_to_json(sheet);

        // insert into sync_details
        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 1,
          REPORT_ID: 9,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });
        // change KNA1 data format

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            CUSTOMER: String(item.CUSTOMER || null),
            COUNTRY: String(item.COUNTRY || null),
            NAME1: String(item.NAME1 || null),
            CITY: String(item.CITY || null),
            POSTAL_CODE: String(item.POSTAL_CODE || null),
            REGION: String(item.REGION || null),
            STREET: String(item.STREET || null),
            TELEPHONE1: String(item.TELEPHONE1 || null),
          };
        });

        // insert into KNA1
        try {
          const insertRows = await INSERT(insertData).into("KNA1");

          // update sync_details status
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 9,
            });
        } catch (err) {
          // update sync_details status
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 9,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("KNB1")) {
        // Convert sheet to JSON object
        const data: insertDataKNB1[] = xlsx.utils.sheet_to_json(sheet);

        // insert into sync_details
        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 1,
          REPORT_ID: 10,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });
        // change KNB1 data format

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            CUSTOMER: String(item.CUSTOMER || null),
            COMPANY_CODE: String(item.COMPANY_CODE || null),
            CREATED_ON: excelSerialToDate(item.CREATED_ON),
            CREATED_BY: String(item.CREATED_BY || null),
            TERMS_OF_PAYMENT: String(item.TERMS_OF_PAYMENT || null),
          };
        });

        // insert into KNB1
        try {
          const insertRows = await INSERT(insertData).into("KNB1");

          // update sync_details status
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 10,
            });
        } catch (err) {
          // update sync_details status
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 10,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("LFBK")) {
        // Convert sheet to JSON object
        const data: insertDataLFBK[] = xlsx.utils.sheet_to_json(sheet);

        // insert into sync_details
        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 2,
          REPORT_ID: 11,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });
        // change KNB1 data format

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            VENDOR: String(item.VENDOR || null),
            COUNTRY: String(item.COUNTRY) || null,
            BANK_KEY: String(item.BANK_KEY || null),
            BANK_ACCOUNT: String(item.BANK_ACCOUNT || null),
            ACCOUNT_HOLDER: String(item.ACCOUNT_HOLDER || null),
          };
        });

        // insert into KNB1
        try {
          const insertRows = await INSERT(insertData).into("LFBK");

          // update sync_details status
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 11,
            });
        } catch (err) {
          // update sync_details status
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 11,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("LFA1")) {
        // Convert sheet to JSON object
        const data: insertDataLFA1[] = xlsx.utils.sheet_to_json(sheet);

        // insert into sync_details
        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 2,
          REPORT_ID: 12,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });
        // change LFA1 data format

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            VENDOR: String(item.VENDOR || null),
            COUNTRY: String(item.COUNTRY || null),
            NAME1: String(item.NAME1 || null),
            CITY: String(item.CITY || null),
            POSTAL_CODE: String(item.POSTAL_CODE || null),
            REGION: String(item.REGION || null),
            TELEPHONE1: String(item.TELEPHONE1 || null),
            CENTRAL_POSTING_BLOCK: String(item.CENTRAL_POSTING_BLOCK || null),
            CENTRAL_PURCHASING_BLOCK: String(
              item.CENTRAL_PURCHASING_BLOCK || null,
            ),
          };
        });

        // insert into LFA1
        try {
          const insertRows = await INSERT(insertData).into("LFA1");

          // update sync_details status
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 12,
            });
        } catch (err) {
          // update sync_details status
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 12,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("KNKK")) {
        const data: insertDataKNKK[] = xlsx.utils.sheet_to_json(sheet);

        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 1,
          REPORT_ID: 13,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            CUSTOMER: String(item.CUSTOMER),
            CREDIT_CONTROL_AREA: String(item.CREDIT_CONTROL_AREA),
            CREDIT_LIMIT: String(item.CREDIT_LIMIT),
          };
        });

        try {
          const insertRows = await INSERT(insertData).into("KNKK");

          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 13,
            });
        } catch (err) {
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 13,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("MAKT")) {
        const data: insertDataMAKT[] = xlsx.utils.sheet_to_json(sheet);

        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 2,
          REPORT_ID: 14,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            MATERIAL: String(item.MATERIAL),
            LANGUAGE_KEY: String(item.LANGUAGE_KEY),
            MATERIAL_DESCRIPTION: String(item.MATERIAL_DESCRIPTION),
          };
        });

        try {
          const insertRows = await INSERT(insertData).into("MAKT");

          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 14,
            });
        } catch (err) {
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 14,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("MARA")) {
        const data: insertDataMARA[] = xlsx.utils.sheet_to_json(sheet);

        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 2,
          REPORT_ID: 15,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            MATERIAL: String(item.MATERIAL),
            CREATED_ON: String(item.CREATED_ON),
            CREATED_BY: String(item.CREATED_BY),
            MATERIAL_TYPE: String(item.MATERIAL_TYPE),
            MATERIAL_GROUP: String(item.MATERIAL_GROUP),
            EAN_UPC: String(item.EAN_UPC),
            MATERIAL_DESCRIPTION: String(item.MATERIAL_DESCRIPTION),
          };
        });

        try {
          const insertRows = await INSERT(insertData).into("MARA");

          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 15,
            });
        } catch (err) {
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 15,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("EKBE")) {
        const data: insertDataEKBE[] = xlsx.utils.sheet_to_json(sheet);

        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 2,
          REPORT_ID: 16,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            PURCHASING_DOCUMENT: String(item.PURCHASING_DOCUMENT),
            ITEM: String(item.ITEM),
            MATERIAL_DESCRIPTION: String(item.MATERIAL_DESCRIPTION),
            INVOICE_VALUE: String(item.INVOICE_VALUE),
            MATERIAL: String(item.MATERIAL),
            PLANT: String(item.PLANT),
            DOCUMENT_DATE: String(item.DOCUMENT_DATE),
            CREATED_BY: String(item.CREATED_BY),
            QUANTITY: String(item.QUANTITY),
          };
        });

        try {
          const insertRows = await INSERT(insertData).into("EKBE");

          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 16,
            });
        } catch (err) {
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 16,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("VBUK")) {
        const data: insertDataVBUK[] = xlsx.utils.sheet_to_json(sheet);

        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 1,
          REPORT_ID: 17,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            SALES_DOCUMENT: String(item.SALES_DOCUMENT),
            DELIVERY_STATUS: String(item.DELIVERY_STATUS),
            OVERALL_DLV_STATUS: String(item.OVERALL_DLV_STATUS),
          };
        });

        try {
          const insertRows = await INSERT(insertData).into("VBUK");

          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 17,
            });
        } catch (err) {
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 17,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("FBL1N")) {
        const data: insertDataFBL1N[] = xlsx.utils.sheet_to_json(sheet);

        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 1,
          REPORT_ID: 18,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            COMPANY_CODE: String(item.COMPANY_CODE || null),
            VENDOR: String(item.VENDOR || null),
            VENDOR_NAME: String(item.VENDOR_NAME || null),
            REFERENCE: String(item.REFERENCE),
            DOCUMENT_DATE: excelSerialToDate(item.DOCUMENT_DATE),
            POSTING_DATE: excelSerialToDate(item.POSTING_DATE),
            NET_DUE_DATE: excelSerialToDate(item.NET_DUE_DATE),
            DOCUMENT_NUMBER: String(item.DOCUMENT_NUMBER || null),
            ENTRY_DATE: excelSerialToDate(item.ENTRY_DATE),
            USER_NAME: String(item.USER_NAME || null),
            PURCHASING_DOCUMENT: String(item.PURCHASING_DOCUMENT || null),
            INVOICE_REFERENCE: String(item.INVOICE_REFERENCE || null),
            CLEARING_DOCUMENT: String(item.CLEARING_DOCUMENT || null),
            ACCOUNT: String(item.ACCOUNT || null),
            CLEARING_DATE: excelSerialToDate(item.CLEARING_DATE),
            AMOUNT_IN_LOCAL_CURRENCY: String(
              item.AMOUNT_IN_LOCAL_CURRENCY || null,
            ),
          };
        });

        try {
          const insertRows = await INSERT(insertData).into("FBL1N");

          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 18,
            });
        } catch (err) {
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 18,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("FBL5N")) {
        const data: insertDataFBL5N[] = xlsx.utils.sheet_to_json(sheet);

        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 2,
          REPORT_ID: 19,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            USER_NAME: String(item.USER_NAME || null),
            ACCOUNT: String(item.ACCOUNT || null),
            DOCUMENT_NUMBER: String(item.DOCUMENT_NUMBER || null),
            POSTING_DATE: excelSerialToDate(item.POSTING_DATE),
            COMPANY_CODE: String(item.COMPANY_CODE || null),
            LINE_ITEM: String(item.LINE_ITEM || null),
            AMOUNT_IN_LOCAL_CURRENCY: String(
              item.AMOUNT_IN_LOCAL_CURRENCY || null,
            ),
            TERMS_OF_PAYMENT: String(item.TERMS_OF_PAYMENT || null),
          };
        });

        try {
          const insertRows = await INSERT(insertData).into("FBL5N");

          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 19,
            });
        } catch (err) {
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 19,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("EBAN")) {
        const data: insertDataEBAN[] = xlsx.utils.sheet_to_json(sheet);

        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 2,
          REPORT_ID: 20,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            PURCHASING_REQUISITION: String(item.PURCHASING_REQUISITION || null),
            PROCESSING_STATUS: String(item.PROCESSING_STATUS || null),
            MATERIAL: String(item.MATERIAL || null),
            REQUISITION_DATE: excelSerialToDate(item.REQUISITION_DATE),
            VALUATION_PRICE: String(item.VALUATION_PRICE || null),
          };
        });

        try {
          const insertRows = await INSERT(insertData).into("EBAN");

          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 20,
            });
        } catch (err) {
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 20,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("CDPOS")) {
        const data: insertDataCDPOS[] = xlsx.utils.sheet_to_json(sheet);

        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 2,
          REPORT_ID: 21,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            CHANGE_DOCUMENT_OBJECT: String(item.CHANGE_DOCUMENT_OBJECT || null),
            OBJECT_VALUE: String(item.OBJECT_VALUE || null),
            DOCUMENT_NUMBER: String(item.DOCUMENT_NUMBER || null),
            TABLE_NAME: String(item.TABLE_NAME || null),
            FIELD_NAME: String(item.FIELD_NAME || null),
            NEW_VALUE: String(item.NEW_VALUE || null),
            OLD_VALUE: String(item.OLD_VALUE || null),
          };
        });

        try {
          const insertRows = await INSERT(insertData).into("CDPOS");

          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 21,
            });
        } catch (err) {
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 21,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("CDHDR")) {
        const data: insertDataCDHDR[] = xlsx.utils.sheet_to_json(sheet);

        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 2,
          REPORT_ID: 22,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            CHANGE_DOCUMENT_OBJECT: String(item.CHANGE_DOCUMENT_OBJECT || null),
            OBJECT_VALUE: String(item.OBJECT_VALUE || null),
            DOCUMENT_NUMBER: String(item.DOCUMENT_NUMBER || null),
            USER: String(item.USER || null),
            DATE: excelSerialToDate(item.DATE),
            TIME: excelSerialToTime(item.TIME),
          };
        });

        try {
          const insertRows = await INSERT(insertData).into("CDHDR");

          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 22,
            });
        } catch (err) {
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 22,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("EKET")) {
        const data: insertDataEKET[] = xlsx.utils.sheet_to_json(sheet);

        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 2,
          REPORT_ID: 23,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            PURCHASING_DOCUMENT: String(item.PURCHASING_DOCUMENT || null),
            ITEM: String(item.ITEM || null),
            SCHEDULED_QUANTITY: String(item.SCHEDULED_QUANTITY || null),
            QUANTITY_DELIVERED: String(item.QUANTITY_DELIVERED || null),
            DELIVERY_DATE: excelSerialToDate(item.DELIVERY_DATE),
          };
        });

        try {
          const insertRows = await INSERT(insertData).into("EKET");

          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 23,
            });
        } catch (err) {
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 23,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("ANLA")) {
        const data: insertDataANLA[] = xlsx.utils.sheet_to_json(sheet);

        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 2,
          REPORT_ID: 24,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            COMPANY_CODE: String(item.COMPANY_CODE || null),
            ASSET: String(item.ASSET || null),
            SUB_NUMBER: String(item.SUB_NUMBER || null),
            ASSET_CLASS: String(item.ASSET_CLASS || null),
            CREATED_BY: String(item.CREATED_BY || null),
            CREATED_ON: excelSerialToDate(item.CREATED_ON),
            ASSET_DESCRIPTION: String(item.ASSET_DESCRIPTION || null),
          };
        });

        try {
          const insertRows = await INSERT(insertData).into("ANLA");

          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 24,
            });
        } catch (err) {
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 24,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("ANLB")) {
        const data: insertDataANLB[] = xlsx.utils.sheet_to_json(sheet);

        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 2,
          REPORT_ID: 25,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            COMPANY_CODE: String(item.COMPANY_CODE || null),
            ASSET: String(item.ASSET || null),
            SUB_NUMBER: String(item.SUB_NUMBER || null),
            CREATED_BY: String(item.CREATED_BY || null),
            CREATED_ON: excelSerialToDate(item.CREATED_ON),
            USEFUL_LIFE: String(item.USEFUL_LIFE || null),
          };
        });

        try {
          const insertRows = await INSERT(insertData).into("ANLB");

          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 25,
            });
        } catch (err) {
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 25,
            });
          console.error("Can not insert rows! ", err);
        }
      } else if (fileNameUpper.includes("ANLZ")) {
        const data: insertDataANLZ[] = xlsx.utils.sheet_to_json(sheet);

        const syncData = await INSERT.into("PCF_DB_SYNC_DETAILS").entries({
          SYNC_HEADER_ID: syncHdrId,
          CONTROL_ID: 2,
          REPORT_ID: 26,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          SYNC_STATUS: "Initiated",
          CREATED_ON: `${new Date().toISOString()}`,
        });

        const insertData = data.map((item) => {
          return {
            SYNC_HEADER_ID: syncHdrId,
            CUSTOMER_ID: 1,
            COMPANY_CODE: String(item.COMPANY_CODE || null),
            ASSET: String(item.ASSET || null),
            SUB_NUMBER: String(item.SUB_NUMBER || null),
            VALID_TO: excelSerialToDate(item.VALID_TO),
            VALID_FROM: excelSerialToDate(item.VALID_FROM),
            COST_CENTER: String(item.COST_CENTER || null),
            PLANT: String(item.PLANT || null),
            LOCATION: String(item.LOCATION || null),
          };
        });

        try {
          const insertRows = await INSERT(insertData).into("ANLZ");

          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Completed",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 26,
            });
        } catch (err) {
          const updateStatus = await UPDATE("PCF_DB_SYNC_DETAILS")
            .set({
              SYNC_STATUS: "Error",
              SYNC_ENDED_AT: `${new Date().toISOString()}`,
            })
            .where({
              SYNC_HEADER_ID: syncHdrId,
              REPORT_ID: 26,
            });
          console.error("Can not insert rows! ", err);
        }
      } else {
        throw new Error("Unknown File Name");
      }
    } catch (err) {
      console.error("Error importing CSV data:", err);
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
