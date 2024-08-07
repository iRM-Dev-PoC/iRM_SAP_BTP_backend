import { Injectable } from "@nestjs/common";
import cds from "@sap/cds";
import * as fs from "fs";
import { join } from "path";
import * as xlsx from "xlsx";

type insertDataPA0002 = {
  CLIENT: string;
  PERSONAL_NUMBER: string;
  FIRST_NAME: string;
  END_DATE: string;
  START_DATE: string;
  LAST_NAME: string;
  DATE_OF_BIRTH: string;
  MIDDLE_NAME?: string;
  ID_NUMBER: string;
  CREATED_BY: string;
  CREATED_ON: string;
};

type insertDataVA05 = {
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
  PERSONAL_NUMBER: string;
  SCHEDULE_LINE_NUMBER: string;
};

type insertDataZSD0070 = {
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
};

type insertDataEKKO = {
  PURCHASING_DOCUMENT: string;
  CREATED_ON: string;
  CREATED_BY: string;
  DOCUMENT_DATE: string;
};

type insertDataEKPO = {
  PURCHASING_DOCUMENT: string;
  MATERIAL: string;
  COMPANY_CODE: string;
  PLANT: string;
  STORAGE_LOCATION: string;
  MATERIAL_GROUP: string;
  PURCHASE_REQUISITION: string;
};

type insertDataVBAK = {
  SALES_DOCUMENT: string;
  CREATED_ON: string;
  TIME: string;
  CREATED_BY: string;
  DOCUMENT_DATE: string;
  NET_VALUE: string;
  PURCHASE_ORDER_NO: string;
  PURCHASE_ORDER_DATE: string;
  TELEPHONE: string;
  SOLD_TO_PARTY: string;
};

type insertDataME2L = {
  PURCHASING_DOCUMENT: string;
  COMPANY_CODE: string;
  CREATED_ON: string;
  CREATED_BY: string;
  VENDOR: string;
  TERMS_OF_PAYMENT: string;
  DOCUMENT_DATE: string;
};

type insertDataMKVZ = {
  NAME_OF_VENDOR: string;
  STREET: string;
  CITY: string;
  ACCOUNT_GROUP: string;
  TERMS_OF_PAYMENT: string;
  VENDOR: string;
};

type insertDataKNA1 = {
  CUSTOMER: string;
  COUNTRY: string;
  NAME1: string;
  CITY: string;
  POSTAL_CODE: string;
  REGION: string;
  STREET: string;
  TELEPHONE1: string;
};

type insertDataKNB1 = {
  CUSTOMER: string;
  COMPANY_CODE: string;
  CREATED_ON: string;
  CREATED_BY: string;
  TERMS_OF_PAYMENT: string;
};

type insertDataLFBK = {
  VENDOR: string;
  COUNTRY: string;
  BANK_KEY: string;
  BANK_ACCOUNT: string;
  ACCOUNT_HOLDER: string;
};

type insertDataLFA1 = {
  VENDOR: string;
  COUNTRY: string;
  NAME1: string;
  CITY: string;
  POSTAL_CODE: string;
  REGION: string;
  TELEPHONE1: string;
};

type insertDataKNKK = {
  CUSTOMER: string;
  CREDIT_CONTROL_AREA: string;
  CREDIT_LIMIT: string;
};

type insertDataMAKT = {
  MATERIAL: string;
  LANGUAGE_KEY: string;
  MATERIAL_DESCRIPTION: string;
};

type insertDataMARA = {
  MATERIAL: string;
  CREATED_ON: string;
  CREATED_BY: string;
  MATERIAL_TYPE: string;
  MATERIAL_GROUP: string;
  EAN_UPC: string;
  MATERIAL_DESCRIPTION: string;
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
            PURCHASING_DOCUMENT: String(item.PURCHASING_DOCUMENT),
            CREATED_ON: String(item.CREATED_ON),
            CREATED_BY: String(item.CREATED_BY),
            DOCUMENT_DATE: String(item.DOCUMENT_DATE),
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
            PURCHASING_DOCUMENT: String(item.PURCHASING_DOCUMENT),
            MATERIAL: String(item.MATERIAL),
            COMPANY_CODE: String(item.COMPANY_CODE),
            PLANT: String(item.PLANT),
            STORAGE_LOCATION: String(item.STORAGE_LOCATION),
            MATERIAL_GROUP: String(item.MATERIAL_GROUP),
            PURCHASE_REQUISITION: String(item.PURCHASE_REQUISITION),
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
        // Convert sheet to JSON object
        const data: insertDataVBAK[] = xlsx.utils.sheet_to_json(sheet);

        // insert into sync_details
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
            CREATED_ON: String(item.CREATED_ON),
            TIME: String(item.TIME),
            CREATED_BY: String(item.CREATED_BY),
            DOCUMENT_DATE: String(item.DOCUMENT_DATE),
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
            CUSTOMER: String(item.CUSTOMER),
            COUNTRY: String(item.COUNTRY),
            NAME1: String(item.NAME1),
            CITY: String(item.CITY),
            POSTAL_CODE: String(item.POSTAL_CODE),
            REGION: String(item.REGION),
            STREET: String(item.STREET),
            TELEPHONE1: String(item.TELEPHONE1),
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
            CUSTOMER: String(item.CUSTOMER),
            COMPANY_CODE: String(item.COMPANY_CODE),
            CREATED_ON: String(item.CREATED_ON),
            CREATED_BY: String(item.CREATED_BY),
            TERMS_OF_PAYMENT: String(item.TERMS_OF_PAYMENT),
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
            VENDOR: String(item.VENDOR),
            COUNTRY: String(item.COUNTRY),
            BANK_KEY: String(item.BANK_KEY),
            BANK_ACCOUNT: String(item.BANK_ACCOUNT),
            ACCOUNT_HOLDER: String(item.ACCOUNT_HOLDER),
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
            VENDOR: String(item.VENDOR),
            COUNTRY: String(item.COUNTRY),
            NAME1: String(item.NAME1),
            CITY: String(item.CITY),
            POSTAL_CODE: String(item.POSTAL_CODE),
            REGION: String(item.REGION),
            TELEPHONE1: String(item.TELEPHONE1),
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
