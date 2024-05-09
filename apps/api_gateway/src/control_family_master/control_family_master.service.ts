import { ResponseDto } from "@app/share_lib/common.dto";
import { HttpStatus, Injectable } from "@nestjs/common";
import cds from "@sap/cds";
import {
  CreateControlFamilyMasterDto,
  DeleteControlFamilyMasterDto,
  UpdateControlFamilyMasterDto,
} from "./dto/controlFamilyMaster.dto";

@Injectable()
export class ControlFamilyMasterService {
  constructor() {}

  async CreateControl(
    // currentUser: CurrentUserDto,
    createControlFamilyDto: CreateControlFamilyMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      const tableName = "PCF_DB_CONTROL_FAMILY_MASTER";
      createControlFamilyDto.created_by = 1;

      if (createControlFamilyDto.control_family_name) {
        const whereClause = cds.parse.expr(
          `CONTROL_FAMILY_NAME= '${createControlFamilyDto.control_family_name}'`,
        );

        const existingcontrol = await db.read(tableName).where(whereClause);

        if (existingcontrol && existingcontrol.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: "control family already exists",
            data: existingcontrol,
          };
        }
      }

      const createdControl = await INSERT.into(tableName).entries({
        CONTROL_FAMILY_NAME: `${createControlFamilyDto.control_family_name}`,
        CONTROL_FAMILY_DESC: `${createControlFamilyDto.control_family_desc}`,
        CUSTOMER_ID: `${createControlFamilyDto.customer_id}`,
        CREATED_BY: createControlFamilyDto.created_by,
      });

      return {
        statuscode: HttpStatus.CREATED,
        message: "control family created successfully",
        data: createControlFamilyDto,
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
    updateControlFamilyDto: UpdateControlFamilyMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      updateControlFamilyDto.changed_on = new Date();
      updateControlFamilyDto.changed_by = 2;

      if (updateControlFamilyDto.control_family_name) {
        const whereClause = cds.parse.expr(
          `ID != '${updateControlFamilyDto.id}' AND CONTROL_FAMILY_NAME = '${updateControlFamilyDto.control_family_name}' AND IS_ACTIVE = 'Y'`,
        );

        const existingcontrol = await db
          .read("PCF_DB_CONTROL_FAMILY_MASTER")
          .where(whereClause);

        if (existingcontrol && existingcontrol.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: "control already exists",
            data: existingcontrol,
          };
        }
      }

      const updatedControlFamily = await UPDATE("PCF_DB_CONTROL_FAMILY_MASTER")
        .set({
          CONTROL_FAMILY_NAME: updateControlFamilyDto.control_family_name,
          CONTROL_FAMILY_DESC: updateControlFamilyDto.control_family_desc,
          CHANGED_ON: updateControlFamilyDto.changed_on.toISOString(),
          CHANGED_BY: updateControlFamilyDto.changed_by,
        })
        .where({
          ID: updateControlFamilyDto.id,
          CUSTOMER_ID: updateControlFamilyDto.customer_id,
          IS_ACTIVE: "Y",
        });

      return {
        statuscode: HttpStatus.OK,
        message: "control family updated successfully",
        data: updatedControlFamily,
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

      const control = await db
        .read("PCF_DB_CONTROL_FAMILY_MASTER")
        .where(whereClause);

      if (!control || control.length === 0) {
        return {
          statuscode: HttpStatus.OK,
          message: "control family not found",
          data: control,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "control family fetched successfully",
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
    deleteControlFamilyMaster: DeleteControlFamilyMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      deleteControlFamilyMaster.changed_on = new Date();
      deleteControlFamilyMaster.changed_by = 3;

      const affectedRows = await UPDATE("PCF_DB_CONTROL_FAMILY_MASTER")
        .set({
          IS_ACTIVE: "N",
          CHANGED_ON: deleteControlFamilyMaster.changed_on.toISOString(),
          CHANGED_BY: deleteControlFamilyMaster.changed_by,
        })
        .where({
          ID: deleteControlFamilyMaster.id,
          CUSTOMER_ID: deleteControlFamilyMaster.customer_id,
          IS_ACTIVE: "Y",
        });

      if (affectedRows === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: "control family not found for deletion",
          data: null,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "control family deleted successfully",
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
        .read("PCF_DB_CONTROL_FAMILY_MASTER")
        .where(whereClause);

      if (!controls || controls.length === 0) {
        return {
          statuscode: HttpStatus.OK,
          message: "No controls family found",
          data: controls,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "controls family fetched successfully",
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
