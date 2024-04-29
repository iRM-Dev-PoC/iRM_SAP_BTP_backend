import { CurrentUserDto, ResponseDto } from '@app/share_lib/common.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import cds from '@sap/cds';
import {
  CreatePrivilegeMasterDto,
  DeletePrivilegeMasterDto,
  UpdatePrivilegeMasterDto,
} from './dto/privilegeMaster.dto';
import { AppService } from '../app.service';
import { DatabaseService } from '@app/share_lib/database/database.service';

@Injectable()
export class PrivilegeMasterService {
  constructor(
    private databaseService: DatabaseService,
    private readonly appService: AppService,
  ) {}

  async CreatePrivilege(
    // currentUser: CurrentUserDto,
    createPrivilegeDto: CreatePrivilegeMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      const tableName = 'PCF_DB_PRIVILEGE';
      createPrivilegeDto.created_by = 1;
      createPrivilegeDto.privilege_name = createPrivilegeDto.privilege_name.toUpperCase();

      if (createPrivilegeDto.privilege_name) {
        const whereClause = cds.parse.expr(
          `Privilege_NAME= '${createPrivilegeDto.privilege_name}'`,
        );

        const existingPrivilege = await db.read(tableName).where(whereClause);

        if (existingPrivilege && existingPrivilege.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'Privilege already exists',
            data: existingPrivilege,
          };
        }
      }

      const createdPrivilege = await INSERT.into(tableName).entries({
        Privilege_NAME: `${createPrivilegeDto.privilege_name}`,
        Privilege_DESC: `${createPrivilegeDto.privilege_desc}`,
        CUSTOMER_ID: `${createPrivilegeDto.customer_id}`,
        CREATED_BY: createPrivilegeDto.created_by,
      });

      return {
        statuscode: HttpStatus.CREATED,
        message: 'Privilege created successfully',
        data: createPrivilegeDto,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: error,
      };
    }
  }

  async UpdatePrivilege(
    // currentUser: CurrentUserDto,
    updatePrivilegeDto: UpdatePrivilegeMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      updatePrivilegeDto.changed_on = new Date();
      updatePrivilegeDto.changed_by = 2;
      updatePrivilegeDto.privilege_name =
        updatePrivilegeDto.privilege_name.toUpperCase();

      if (updatePrivilegeDto.privilege_name) {
        const whereClause = cds.parse.expr(
          `ID != '${updatePrivilegeDto.id}' AND IS_ACTIVE = 'Y'`,
        );

        const existingPrivilege = await db
          .read('PCF_DB_PRIVILEGE')
          .where(whereClause);

        if (existingPrivilege && existingPrivilege.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'Privilege already exists',
            data: existingPrivilege,
          };
        }
      }

      const updatedPrivilege = await UPDATE("PCF_DB_PRIVILEGE")
        .set({
          PRIVILEGE_NAME: updatePrivilegeDto.privilege_name,
          PRIVILEGE_DESC: updatePrivilegeDto.privilege_desc,
          CHANGED_ON: updatePrivilegeDto.changed_on.toISOString().slice(0, 23),
          CHANGED_BY: updatePrivilegeDto.changed_by,
        })
        .where({
          ID: updatePrivilegeDto.id,
          CUSTOMER_ID: updatePrivilegeDto.customer_id,
          IS_ACTIVE: "Y",
        });

      return {
        statuscode: HttpStatus.OK,
        message: 'Privilege updated successfully',
        data: updatedPrivilege,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async GetPrivilege(
    // currentUser: CurrentUserDto,
    id,
    customer_id,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      const whereClause = cds.parse.expr(
        `ID = '${Number(id)}'AND CUSTOMER_ID = '${Number(customer_id)}' AND IS_ACTIVE = 'Y'`,
      );

      const privilege = await db.read('PCF_DB_PRIVILEGE').where(whereClause);

      if (!privilege || privilege.length === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: "Privilege not found",
          data: privilege,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "Privilege fetched successfully",
        data: privilege,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async DeletePrivilege(
    // currentUser: CurrentUserDto,
    deletePrivilegeMaster: DeletePrivilegeMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      deletePrivilegeMaster.changed_on = new Date();
      deletePrivilegeMaster.changed_by = 3;

      const affectedRows = await UPDATE("PCF_DB_PRIVILEGE")
        .set({
          IS_ACTIVE: "N",
          CHANGED_ON: deletePrivilegeMaster.changed_on.toISOString(),
          CHANGED_BY: deletePrivilegeMaster.changed_by,
        })
        .where({
          ID: deletePrivilegeMaster.id,
          CUSTOMER_ID: deletePrivilegeMaster.customer_id,
          IS_ACTIVE: "Y",
        });

      if (affectedRows === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'Privilege not found for deletion',
          data: null,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: 'Privilege deleted successfully',
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

  async GetAllPrivileges() // currentUser: CurrentUserDto,
  : Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      const whereClause = cds.parse.expr(`IS_ACTIVE = 'Y'`);

      const Privileges = await db
        .read("PCF_DB_PRIVILEGE")
        .where(whereClause);

      if (!Privileges || Privileges.length === 0) {
        return {
          statuscode: HttpStatus.OK,
          message: 'No Privileges found',
          data: Privileges,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: 'Privileges fetched successfully',
        data: Privileges,
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
