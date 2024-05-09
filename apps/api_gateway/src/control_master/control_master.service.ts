import { ResponseDto } from "@app/share_lib/common.dto";
import { HttpStatus, Injectable } from "@nestjs/common";
import cds from "@sap/cds";
import {
  CreateControlMasterDto,
  DeleteControlMasterDto,
  UpdateControlMasterDto,
} from "./dto/controlMaster.dto";

@Injectable()
export class ControlMasterService {
  constructor() {}

  async CreateControl(
    // currentUser: CurrentUserDto,
    createControlDto: CreateControlMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      const tableName = "PCF_DB_CONTROL_MASTER";
      createControlDto.created_by = 1;

      if (createControlDto.control_name) {
        const whereClause = cds.parse.expr(
          `CONTROL_NAME= '${createControlDto.control_name}'`,
        );

        const existingcontrol = await db.read(tableName).where(whereClause);

        if (existingcontrol && existingcontrol.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: "control already exists",
            data: existingcontrol,
          };
        }
      }

      const createdControl = await INSERT.into(tableName).entries({
        CONTROL_FAMILY_ID: `${createControlDto.control_family_id}`,
        CONTROL_NAME: `${createControlDto.control_name}`,
        CONTROL_DESC: `${createControlDto.control_desc}`,
        CUSTOMER_ID: `${createControlDto.customer_id}`,
        CREATED_BY: createControlDto.created_by,
      });

      return {
        statuscode: HttpStatus.CREATED,
        message: "control created successfully",
        data: createControlDto,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: error,
      };
    }
  }

  async UpdateControl(
    // currentUser: CurrentUserDto,
    updateControlDto: UpdateControlMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      updateControlDto.changed_on = new Date();
      updateControlDto.changed_by = 2;

      if (updateControlDto.control_name) {
        const whereClause = cds.parse.expr(
          `ID != '${updateControlDto.id}' AND CONTROL_NAME = '${updateControlDto.control_name.toUpperCase()}' AND IS_ACTIVE = 'Y'`,
        );

        const existingcontrol = await db
          .read("PCF_DB_CONTROL_MASTER")
          .where(whereClause);

        if (existingcontrol && existingcontrol.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: "control already exists",
            data: existingcontrol,
          };
        }
      }

      const updatedControl = await UPDATE("PCF_DB_CONTROL_MASTER")
        .set({
          CONTROL_NAME: updateControlDto.control_name,
          CONTROL_DESC: updateControlDto.control_desc,
          CHANGED_ON: updateControlDto.changed_on.toISOString().slice(0, 23),
          CHANGED_BY: updateControlDto.changed_by,
        })
        .where({
          ID: updateControlDto.id,
          CUSTOMER_ID: updateControlDto.customer_id,
          IS_ACTIVE: "Y",
        });

      return {
        statuscode: HttpStatus.OK,
        message: "control updated successfully",
        data: updatedControl,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async GetControl(
    // currentUser: CurrentUserDto,
    id,
    customer_id,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      const whereClause = cds.parse.expr(
        `ID = '${Number(id)}' AND CUSTOMER_ID = '${Number(customer_id)}' AND IS_ACTIVE = 'Y'`,
      );

      const control = await db.read("PCF_DB_CONTROL_MASTER").where(whereClause);

      if (!control || control.length === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: "control not found",
          data: control,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "control fetched successfully",
        data: control,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async DeleteControl(
    // currentUser: CurrentUserDto,
    deleteControlMaster: DeleteControlMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      deleteControlMaster.changed_on = new Date();
      deleteControlMaster.changed_by = 3;

      const affectedRows = await UPDATE("PCF_DB_CONTROL_MASTER")
        .set({
          IS_ACTIVE: "N",
          CHANGED_ON: deleteControlMaster.changed_on.toISOString(),
          CHANGED_BY: deleteControlMaster.changed_by,
        })
        .where({
          ID: deleteControlMaster.id,
          CUSTOMER_ID: deleteControlMaster.customer_id,
          IS_ACTIVE: "Y",
        });

      if (affectedRows === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: "control not found for deletion",
          data: null,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "control deleted successfully",
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

  async GetAllControls() // currentUser: CurrentUserDto,
  : Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      const whereClause = cds.parse.expr(`IS_ACTIVE = 'Y'`);

      const controls = await db
        .read("PCF_DB_CONTROL_MASTER")
        .where(whereClause);

      if (!controls || controls.length === 0) {
        return {
          statuscode: HttpStatus.OK,
          message: "No controls found",
          data: controls,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "controls fetched successfully",
        data: controls,
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
