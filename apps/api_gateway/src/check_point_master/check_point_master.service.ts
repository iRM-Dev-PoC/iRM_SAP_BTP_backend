import { CurrentUserDto, ResponseDto } from '@app/share_lib/common.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import cds from '@sap/cds';
import {
  CreateCheckPointMasterDto,
  DeleteCheckPointMasterDto,
  UpdateCheckPointMasterDto,
} from "./dto/checkpointMaster.dto";
import { AppService } from '../app.service';
import { DatabaseService } from '@app/share_lib/database/database.service';

@Injectable()
export class CheckPointMasterService {
  constructor(
    private databaseService: DatabaseService,
    private readonly appService: AppService,
  ) {}

  async CreateCheckPoint(
    // currentUser: CurrentUserDto,
    checkpointMaster: CreateCheckPointMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      const tableName = "PCF_DB_CHECK_POINT_MASTER";
      checkpointMaster.created_by = 1;
      checkpointMaster.check_point_name =
        checkpointMaster.check_point_name.toUpperCase();

      if (checkpointMaster.check_point_name) {
        const whereClause = cds.parse.expr(
          `CHECK_POINT_NAME= '${checkpointMaster.check_point_name}'`,
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
        CHECK_POINT_NAME: `${checkpointMaster.check_point_name}`,
        CHECK_POINT_DESC: `${checkpointMaster.check_point_desc}`,
        CUSTOMER_ID: `${checkpointMaster.customer_id}`,
        CONTROL_ID: `${checkpointMaster.control_id}`,
        CREATED_BY: checkpointMaster.created_by,
      });

      return {
        statuscode: HttpStatus.CREATED,
        message: "Check Point Created Successfully",
        data: checkpointMaster,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: error,
      };
    }
  }

  async UpdateCheckPoint(
    // currentUser: CurrentUserDto,
    updateCheckPointMaster: UpdateCheckPointMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      updateCheckPointMaster.changed_on = new Date();
      updateCheckPointMaster.changed_by = 2;

      if (updateCheckPointMaster.check_point_name) {
        const whereClause = cds.parse.expr(
          `ID != '${updateCheckPointMaster.id}' AND CHECK_POINT_NAME = '${updateCheckPointMaster.check_point_name.toUpperCase()}' AND IS_ACTIVE = 'Y'`,
        );

        const existingModule = await db
          .read("PCF_DB_CHECK_POINT_MASTER")
          .where(whereClause);

        if (existingModule && existingModule.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: "Check Point already exists",
            data: existingModule,
          };
        }
      }

      const updatedModule = await UPDATE("PCF_DB_CHECK_POINT_MASTER")
        .set({
          CHECK_POINT_NAME:
            updateCheckPointMaster.check_point_name.toUpperCase(),
          CHECK_POINT_DESC: updateCheckPointMaster.check_point_desc,
          CHANGED_ON: updateCheckPointMaster.changed_on
            .toISOString()
            .slice(0, 23),
          CHANGED_BY: updateCheckPointMaster.changed_by,
        })
        .where({
          ID: updateCheckPointMaster.id,
          CUSTOMER_ID: updateCheckPointMaster.customer_id,
          IS_ACTIVE: "Y",
        });

      return {
        statuscode: HttpStatus.OK,
        message: "Check Point updated successfully",
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

  async GetCheckPoint(
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
        .read("PCF_DB_CHECK_POINT_MASTER")
        .where(whereClause);

      if (!module || module.length === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: "Check Point not found",
          data: module,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "Check Point fetched successfully",
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

  async DeleteCheckPoint(
    // currentUser: CurrentUserDto,
    deleteModuleMaster: DeleteCheckPointMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      deleteModuleMaster.changed_on = new Date();
      deleteModuleMaster.changed_by = 3;

      const affectedRows = await UPDATE("PCF_DB_CHECK_POINT_MASTER")
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
          message: "check point not found for deletion",
          data: null,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "check point deleted successfully",
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

  async GetAllCheckPoints() // currentUser: CurrentUserDto,
  : Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      const whereClause = cds.parse.expr(`IS_ACTIVE = 'Y'`);

      const modules = await db
        .read("PCF_DB_CHECK_POINT_MASTER")
        .where(whereClause);

      if (!modules || modules.length === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: "No check point found",
          data: modules,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "check points fetched successfully",
        data: modules,
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
