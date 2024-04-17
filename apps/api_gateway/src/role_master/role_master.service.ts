import { CurrentUserDto, ResponseDto } from '@app/share_lib/common.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateRoleMasterDto,
  DeleteRoleMasterDto,
  UpdateRoleMasterDto,
} from './dto/roleMaster.dto';
import cds from '@sap/cds';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '@app/share_lib/database/database.service';
import { AppService } from '../app.service';

@Injectable()
export class RoleMasterService {
  constructor(
    private databaseService: DatabaseService,
    private readonly appService: AppService,
  ) {}

  async CreateRoleMaster(
    // currentUser: CurrentUserDto,
    createRoleMaster: CreateRoleMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      createRoleMaster.created_by = 1;
      createRoleMaster.role_name = createRoleMaster.role_name.toUpperCase();

      if (createRoleMaster.role_name) {
        const whereClause = cds.parse.expr(
          `ROLE_NAME = '${createRoleMaster.role_name}' AND IS_ACTIVE = 'Y'`,
        );

        const existingRole = await db
          .read('PCF_DB_ROLE_MASTER')
          .where(whereClause);

        if (existingRole && existingRole.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'Role already exists',
            data: existingRole,
          };
        }
      }

      const createdRole = await INSERT.into('PCF_DB_ROLE_MASTER').entries({
        ROLE_NAME: `${createRoleMaster.role_name}`,
        ROLE_DESC: `${createRoleMaster.role_desc}`,
        CUSTOMER_ID: `${createRoleMaster.customer_id}`,
        ROLE_PERMISSION: `${createRoleMaster.role_permission}`,
        CREATED_BY: createRoleMaster.created_by,
      });

      if (!createdRole) {
        return {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Role creation failed',
          data: createdRole,
        };
      }

      return {
        statuscode: HttpStatus.CREATED,
        message: 'Role created successfully',
        data: createRoleMaster,
      };
    } catch (error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Role creation failed',
        data: error,
      };
    }
  }

  async GetRoleMaster(id, customer_id): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      const whereClause = cds.parse.expr(
        `ID = '${Number(id)}' AND IS_ACTIVE = 'Y'`,
      );

      const result = await db.read('PCF_DB_ROLE_MASTER').where(whereClause);

      if (!result || result.length === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'Role not found',
          data: result,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: 'Role fetched successfully',
        data: result,
      };
    } catch (error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Role fetch failed',
        data: error,
      };
    }
  }

  async UpdateRoleMaster(
    // currentUser: CurrentUserDto,
    updateRoleMaster: UpdateRoleMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      updateRoleMaster.changed_on = new Date();
      updateRoleMaster.changed_by = 2;
      updateRoleMaster.role_name = updateRoleMaster.role_name.toUpperCase();
      
      if (updateRoleMaster.role_name) {
        const whereClause = cds.parse.expr(
          `ID != '${updateRoleMaster.id}' AND CUSTOMER_ID = '${updateRoleMaster.customer_id}' AND ROLE_NAME = '${updateRoleMaster.role_name}' AND IS_ACTIVE = 'Y'`,
        );

        const existingRole = await db
          .read('PCF_DB_ROLE_MASTER')
          .where(whereClause);

        if (existingRole && existingRole.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'Role already exists',
            data: existingRole,
          };
        }
      }

      const updatedRole = await UPDATE('PCF_DB_ROLE_MASTER')
        .set({
          ROLE_NAME: updateRoleMaster.role_name,
          ROLE_DESC: updateRoleMaster.role_desc,
          CHANGED_ON: updateRoleMaster.changed_on.toISOString(),
          CHANGED_BY: updateRoleMaster.changed_by,
        })
        .where({
          ID: updateRoleMaster.id,
          CUSTOMER_ID: updateRoleMaster.customer_id,
          IS_ACTIVE: 'Y',
        });

      if (!updatedRole) {
        return {
          statuscode: HttpStatus.NOT_MODIFIED,
          message: 'Role not updated',
          data: updatedRole,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: 'Role updated successfully',
        data: updateRoleMaster,
      };
    } catch (error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Role update failed',
        data: error,
      };
    }
  }

  async DeleteRoleMaster(
    // currentUser: CurrentUserDto,
    deleteRoleMaster: DeleteRoleMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      const affectedRows = await UPDATE('PCF_DB_ROLE_MASTER')
        .set({ IS_ACTIVE: 'N' })
        .where({
          ID: deleteRoleMaster.id,
          CUSTOMER_ID: deleteRoleMaster.customer_id,
          IS_ACTIVE: 'Y',
        });

      if (affectedRows === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'Module not found for deletion',
          data: null,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: 'Module deleted successfully',
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

  async GetAllRolesMaster() // currentUser: CurrentUserDto,
  : Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      const whereClause = cds.parse.expr(
        `IS_ACTIVE = 'Y'`,
      );

      const roles = await db.read('PCF_DB_ROLE_MASTER').where(whereClause);

      if (!roles || roles.length === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'No roles found',
          data: roles,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: 'Roles fetched successfully',
        data: roles,
      };
    } catch (error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch roles',
        data: error,
      };
    }
  }
}
