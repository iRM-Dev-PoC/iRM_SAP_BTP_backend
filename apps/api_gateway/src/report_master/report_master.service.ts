import { CurrentUserDto, ResponseDto } from '@app/share_lib/common.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import cds from '@sap/cds';
import {
  CreateReportMasterDto,
  DeleteReportMasterDto,
  UpdateReportMasterDto,
} from './dto/reportMaster.dto';

@Injectable()
export class ReportMasterService {

  async CreateReport(
    // currentUser: CurrentUserDto,
    createReportDto: CreateReportMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      const tableName = 'PCF_DB_REPORT_MASTER';
      createReportDto.created_by = 1;
      createReportDto.report_name = createReportDto.report_name.toUpperCase();

      if (createReportDto.report_name) {
        const whereClause = cds.parse.expr(
          `Report_NAME= '${createReportDto.report_name}'`,
        );

        const existingReport = await db.read(tableName).where(whereClause);

        if (existingReport && existingReport.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'Report already exists',
            data: existingReport,
          };
        }
      }

      const createdReport = await INSERT.into(tableName).entries({
        REPORT_NAME: `${createReportDto.report_name}`,
        REPORT_DESTINATION: `${createReportDto.report_destination}`,
        REPORT_PATH: `${createReportDto.report_path}`,
        CUSTOMER_ID: `${createReportDto.customer_id}`,
        CREATED_BY: createReportDto.created_by,
      });

      return {
        statuscode: HttpStatus.CREATED,
        message: 'Report created successfully',
        data: createReportDto,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: error,
      };
    }
  }

  async UpdateReport(
    // currentUser: CurrentUserDto,
    updateReportDto: UpdateReportMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      updateReportDto.changed_on = new Date();
      updateReportDto.changed_by = 2;

      if (updateReportDto.report_name) {
        const whereClause = cds.parse.expr(
          `ID != '${updateReportDto.id}' AND CUSTOMER_ID = '${updateReportDto.customer_id}' AND REPORT_NAME = '${updateReportDto.report_name.toUpperCase()}' AND IS_ACTIVE = 'Y'`,
        );

        const existingReport = await db
          .read('PCF_DB_REPORT_MASTER')
          .where(whereClause);

        if (existingReport && existingReport.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'Report already exists',
            data: existingReport,
          };
        }
      }

      const updatedReport = await UPDATE('PCF_DB_REPORT_MASTER')
        .set({
          REPORT_NAME: updateReportDto.report_name,
          REPORT_DESTINATION: updateReportDto.report_destination,
          REPORT_PATH: updateReportDto.report_path,
          CHANGED_ON: updateReportDto.changed_on.toISOString().slice(0, 23),
          CHANGED_BY: updateReportDto.changed_by,
        })
        .where({
          ID: updateReportDto.id,
          CUSTOMER_ID: updateReportDto.customer_id,
          IS_ACTIVE: 'Y',
        });

      return {
        statuscode: HttpStatus.OK,
        message: 'Report updated successfully',
        data: updatedReport,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async GetReport(
    // currentUser: CurrentUserDto,
    id,
    customer_id,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      const whereClause = cds.parse.expr(
        `ID = '${Number(id)}' AND CUSTOMER_ID = '${Number(customer_id)}' AND IS_ACTIVE = 'Y'`,
      );

      const Report = await db.read('PCF_DB_REPORT_MASTER').where(whereClause);

      if (!Report || Report.length === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'Report not found',
          data: Report,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: 'Report fetched successfully',
        data: Report,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async DeleteReport(
    // currentUser: CurrentUserDto,
    deleteReportMaster: DeleteReportMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      deleteReportMaster.changed_on = new Date();
      deleteReportMaster.changed_by = 3;

      const affectedRows = await UPDATE('PCF_DB_REPORT_MASTER')
        .set({
          IS_ACTIVE: 'N',
          CHANGED_ON: deleteReportMaster.changed_on.toISOString(),
          CHANGED_BY: deleteReportMaster.changed_by
        })
        .where({
          ID: deleteReportMaster.id,
          CUSTOMER_ID: deleteReportMaster.customer_id,
          IS_ACTIVE: 'Y',
        });

      if (affectedRows === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'Report not found for deletion',
          data: null,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: 'Report deleted successfully',
        data: affectedRows,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async GetAllReports() // currentUser: CurrentUserDto,
  : Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      const whereClause = cds.parse.expr(`IS_ACTIVE = 'Y'`);

      const Reports = await db.read('PCF_DB_REPORT_MASTER').where(whereClause);

      if (!Reports || Reports.length === 0) {
        return {
          statuscode: HttpStatus.OK,
          message: 'No Reports found',
          data: Reports,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: 'Reports fetched successfully',
        data: Reports,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: error,
      };
    }
  }
}
