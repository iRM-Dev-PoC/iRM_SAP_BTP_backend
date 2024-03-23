import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../auth/src';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { diskStorage } from 'multer';
import { ExcelService } from '@app/share_lib/excel.service';
import * as fs from 'fs';
import { CSVService } from '@app/share_lib/csv.service';
import * as xlsx from 'xlsx';
import { Pool } from 'pg';
import { DataImportService } from './data-import/data-import.service';


@Controller('dataload')
export class DataLoadController {
  constructor(
    private authService: AuthService,
    private excelService: ExcelService,
    private csvService: CSVService,
    private readonly dataImportService: DataImportService,
  ) {}

  @Get('get-hello')
  getHello(@Req() req: Request) {
    if (
      !this.authService.ValidatePrivileges(
        req,
        'dataload',
        'dataload_landing_page',
        'read',
      )
    ) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return 'Hello from dataload controller!';
  }

  @Post('upload-and-store')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, process.env.UPLOAD_DEST);
        },
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.xlsx', '.xls', '.csv'];
        const extname = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(extname)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed',
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
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    console.log(files);

    // Connect to PostgreSQL
    const pool = new Pool({
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
    });

    try {
      const results = [];

      for (const file of files) {
        const extname = path.extname(file.originalname).toLowerCase();

        if (extname === '.csv') {
          // Create temporary table and import CSV data
          await this.dataImportService.importCSVToTempTable(file.path, pool);
          results.push({
            message: `File ${file.originalname} data stored in temporary table`,
          });
        } else if (extname === '.xlsx' || extname === '.xls') {
          // Convert Excel to CSV, create temporary table, and import data
          const csvPath = await this.dataImportService.convertExcelToCSV(
            file.path,
          );
          await this.dataImportService.importCSVToTempTable(csvPath, pool);
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

      return {
        message: 'Files uploaded successfully',
        results,
      };
    } catch (err) {
      throw new BadRequestException(err.message);
    } finally {
      pool.end(); // Close the PostgreSQL connection
    }
  }

  @Post('fetch-excel-data')
  async processFile(@Req() req: Request, @Body() { filename, columns }) {
    const extname = path.extname(filename).toLowerCase();
    if (extname === '.xlsx' || extname === '.xls') {
      return await this.excelService.GetDataFromExcel(filename, columns);
    } else if (extname === '.csv') {
      return await this.csvService.GetDataFromCSV(filename, columns);
    } else {
      throw new BadRequestException('Unsupported file format');
    }
  }
}
