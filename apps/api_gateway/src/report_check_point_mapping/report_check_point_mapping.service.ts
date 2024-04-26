import { CurrentUserDto, ResponseDto } from '@app/share_lib/common.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import cds from '@sap/cds';
import {
  CreateReportCheckPointMappingDto,
  DeleteReportCheckPointMappingDto,
  UpdateReportCheckPointMappingDto,
} from "./dto/report_check_point_mapping.dto";
import { AppService } from '../app.service';
import { DatabaseService } from '@app/share_lib/database/database.service';

@Injectable()
export class ReportCheckPointMappingService {
  constructor(
    private databaseService: DatabaseService,
    private readonly appService: AppService,
  ) {}

  async CreateReportCheckPointMapping(
    // currentUser: CurrentUserDto,
    createReportCheckPointMapping: CreateReportCheckPointMappingDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      const tableName = "PCF_DB_REPORT_CHECKPOINT_MAPPING";
      createReportCheckPointMapping.created_by = 1;

      if (
        createReportCheckPointMapping.report_id &&
        createReportCheckPointMapping.check_point_id
      ) {
        const whereClause = cds.parse.expr(
          `REPORT_ID= '${createReportCheckPointMapping.report_id}' AND CHECK_POINT_ID = '${createReportCheckPointMapping.check_point_id}' AND IS_ACTIVE = 'Y'`,
        );

        const existingModule = await db.read(tableName).where(whereClause);

        if (existingModule && existingModule.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: "Check Point already exists",
            data: existingModule,
          };
        }
      }

      const createdModule = await INSERT.into(tableName).entries({
        REPORT_ID: `${createReportCheckPointMapping.report_id}`,
        CHECK_POINT_ID: `${createReportCheckPointMapping.check_point_id}`,
        CUSTOMER_ID: `${createReportCheckPointMapping.customer_id}`,
        CREATED_BY: createReportCheckPointMapping.created_by,
      });

      return {
        statuscode: HttpStatus.CREATED,
        message: "Check Point Created Successfully",
        data: createReportCheckPointMapping,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: error,
      };
    }
  }

  async UpdateReportCheckPointMapping(
    // currentUser: CurrentUserDto,
    updateReportCheckPointMapping: UpdateReportCheckPointMappingDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      updateReportCheckPointMapping.changed_on = new Date();
      updateReportCheckPointMapping.changed_by = 2;

      if (
        updateReportCheckPointMapping.report_id &&
        updateReportCheckPointMapping.check_point_id
      ) {
        const whereClause = cds.parse.expr(
          `ID != '${updateReportCheckPointMapping.id}' AND REPORT_ID = '${updateReportCheckPointMapping.report_id}' AND CHECK_POINT_ID = '${updateReportCheckPointMapping.check_point_id}' AND IS_ACTIVE = 'Y'`,
        );

        const existingModule = await db
          .read("PCF_DB_REPORT_CHECKPOINT_MAPPING")
          .where(whereClause);

        if (existingModule && existingModule.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: "Check Point already exists",
            data: existingModule,
          };
        }
      }

      const updatedModule = await UPDATE("PCF_DB_REPORT_CHECKPOINT_MAPPING")
        .set({
          REPORT_ID: updateReportCheckPointMapping.report_id,
          CHECK_POINT_ID: updateReportCheckPointMapping.check_point_id,
          CHANGED_ON: updateReportCheckPointMapping.changed_on
            .toISOString()
            .slice(0, 23),
          CHANGED_BY: updateReportCheckPointMapping.changed_by,
        })
        .where({
          ID: updateReportCheckPointMapping.id,
          CUSTOMER_ID: updateReportCheckPointMapping.customer_id,
          IS_ACTIVE: "Y",
        });

      return {
        statuscode: HttpStatus.OK,
        message: "Report Check Point Mapping updated successfully",
        data: updatedModule,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async GetReportCheckPointMapping(
    // currentUser: CurrentUserDto,
    id,
    customer_id,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      const whereClause = cds.parse.expr(
        `ID = '${Number(id)}' AND CUSTOMER_ID = '${Number(customer_id)}' AND IS_ACTIVE = 'Y'`,
      );

      const module = await db
        .read("PCF_DB_REPORT_CHECKPOINT_MAPPING")
        .where(whereClause);

      if (!module || module.length === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: "Report Check Point Mapping not found",
          data: module,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "Report Check Point Mapping fetched successfully",
        data: module,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async DeleteReportCheckPointMapping(
    // currentUser: CurrentUserDto,
    deleteModuleMaster: DeleteReportCheckPointMappingDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      deleteModuleMaster.changed_on = new Date();
      deleteModuleMaster.changed_by = 3;

      const affectedRows = await UPDATE("PCF_DB_REPORT_CHECKPOINT_MAPPING")
        .set({
          IS_ACTIVE: "N",
          CHANGED_ON: deleteModuleMaster.changed_on.toISOString(),
          CHANGED_BY: deleteModuleMaster.changed_by,
        })
        .where({
          ID: deleteModuleMaster.id,
          CUSTOMER_ID: deleteModuleMaster.customer_id,
          IS_ACTIVE: "Y",
        });

      if (affectedRows === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: "Report Check Point Mapping not found for deletion",
          data: null,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "Report Check Point Mapping deleted successfully",
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

  async GetAllReportCheckPointMappings() // currentUser: CurrentUserDto,
  : Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      const whereClause = cds.parse.expr(`IS_ACTIVE = 'Y'`);

      const modules = await db
        .read("PCF_DB_REPORT_CHECKPOINT_MAPPING")
        .where(whereClause);
        
      const checkPointData = await db
        .read("PCF_DB_CHECK_POINT_MASTER")
        .columns(
          "ID",
          "CHECK_POINT_NAME"
        )
        .where(whereClause);

      const reportData = await db
        .read("PCF_DB_REPORT_MASTER")
        .columns("ID", "REPORT_NAME")
        .where(whereClause);

      console.log(`report data = ${reportData} | check point data = ${checkPointData}`);
      
      if (!modules || modules.length === 0) {
        return {
          statuscode: HttpStatus.OK,
          message: "No Report Check Point Mapping found",
          data: module
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "Report Check Point Mapping fetched successfully",
        data: modules,
        reportdata: reportData,
        checkpointdata: checkPointData,
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
