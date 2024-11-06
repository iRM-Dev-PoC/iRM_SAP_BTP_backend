import { CSVService } from "@app/share_lib/csv.service";
import { ExcelService } from "@app/share_lib/excel.service";
import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import cds from "@sap/cds";
import { Request } from "express";
import * as fs from "fs";
import { diskStorage } from "multer";
import * as path from "path";
import { DataImportService } from "./data-import.service";
import { DataService } from "./data.service";
import { ResponseDto } from "@app/share_lib/common.dto";

@Controller("lo/dataload")
export class DataLoadController {
  constructor(
    private excelService: ExcelService,
    private csvService: CSVService,
    private readonly dataImportService: DataImportService,
    private readonly dataService: DataService,
  ) {}

  @Post("upload")
  @UseInterceptors(
    FilesInterceptor("files", 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, process.env.UPLOAD_DEST);
        },
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = [".xlsx", ".xls", ".csv"];
        const extname = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(extname)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              "Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed",
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadAndStoreFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: Request,
  ): Promise<ResponseDto> {
    {
      if (!files || files.length === 0) {
        throw new BadRequestException("No files uploaded");
      }

      console.log(files);

      try {
        const results = [];

        const db = await cds.connect.to("db");

        // const query = `SELECT COUNT(ID) CNT FROM LO_SYNC_HEADER WHERE CUSTOMER_ID = ${req.body.CUST_ID}`;
        const result = await db.run(
          `SELECT COUNT(ID) CNT FROM LO_SYNC_HEADER WHERE CUSTOMER_ID = ${req.body.CUST_ID}`,
        );

        let syncId: String;

        if (result.length > 0) {
          syncId = `SYNC-${result[0].CNT + 1}`;
        } else {
          syncId = `SYNC-1`;
        }

        // insert into sync_hdr table
        const hdrData = await INSERT.into("LO_SYNC_HEADER").entries({
          SYNC_ID: `${syncId}`,
          SYNC_STARTED_AT: `${new Date().toISOString()}`,
          CREATED_BY: `1`,
          CREATED_ON: `${new Date().toISOString()}`,
          CUSTOMER_ID: `${req.body.CUST_ID}`,
        });

        if (hdrData) {
          for (const file of files) {
            const extname = path.extname(file.originalname).toLowerCase();

            if (extname === ".csv") {
              // Create temporary table and import CSV data
              await this.dataImportService.importCSVToTempTable(
                file.path,
                syncId,
                file.originalname,
              );
              results.push({
                message: `File ${file.originalname} data stored in temporary table`,
              });
            } else if (extname === ".xlsx" || extname === ".xls") {
              // Convert Excel to CSV, create temporary table, and import data
              const csvPath = file.path;

              await this.dataImportService.importCSVToTempTable(
                csvPath,
                syncId,
                file.originalname,
              );
              fs.unlinkSync(csvPath); // Remove the temporary CSV file
              results.push({
                message: `File ${file.originalname} data stored in temporary table`,
              });
            } else {
              results.push({
                message: `Unsupported file format for ${file.originalname}`,
              });
            }
          }
        } else {
          throw new BadRequestException("Failed to intialize sync!");
        }

        return {
          statuscode: HttpStatus.OK,
          message: "Files uploaded successfully",
          results,
        };
      } catch (err) {
        throw new BadRequestException(err.message);
      }
    }
  }

  @Post("fetch-excel-data")
  async processFile(@Req() req: Request, @Body() { filename, columns }) {
    const extname = path.extname(filename).toLowerCase();
    if (extname === ".xlsx" || extname === ".xls") {
      return await this.excelService.GetDataFromExcel(filename, columns);
    } else if (extname === ".csv") {
      return await this.csvService.GetDataFromCSV(filename, columns);
    } else {
      throw new BadRequestException("Unsupported file format");
    }
  }

  // @Post("simulate-data")
  // async simulateData(@Req() req: Request, @Body() { id }) {
  //   return await this.dataService.dataSimulation(id);
  // }
}
