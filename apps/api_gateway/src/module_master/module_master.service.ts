import { CurrentUserDto, ResponseDto } from '@app/share_lib/common.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import cds from '@sap/cds';
import {
  CreateModuleMasterDto,
  DeleteModuleMasterDto,
  UpdateModuleMasterDto,
} from './dto/moduleMaster.dto';
import { AppService } from '../app.service';
import { DatabaseService } from '@app/share_lib/database/database.service';

@Injectable()
export class ModuleMasterService {
  constructor(
    private databaseService: DatabaseService,
    private readonly appService: AppService,
  ) {}

  async CreateModule(
    // currentUser: CurrentUserDto,
    createModuleDto: CreateModuleMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      const tableName = 'PCF_DB_MODULE_MASTER';
      createModuleDto.created_by = 1;
      createModuleDto.module_name = createModuleDto.module_name.toUpperCase();
      createModuleDto.display_module_name =
        createModuleDto.display_module_name.toUpperCase();

      if (createModuleDto.module_name || createModuleDto.display_module_name) {
        const whereClause = cds.parse.expr(
          `MODULE_NAME= '${createModuleDto.module_name}' OR DISPLAY_MODULE_NAME= '${createModuleDto.display_module_name}'`,
        );

        const existingModule = await db.read(tableName).where(whereClause);

        if (existingModule && existingModule.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'Module already exists',
            data: existingModule,
          };
        }
      }

      const createdModule = await INSERT.into(tableName).entries({
        MODULE_NAME: `${createModuleDto.module_name}`,
        MODULE_DESC: `${createModuleDto.module_desc}`,
        DISPLAY_MODULE_NAME: `${createModuleDto.display_module_name}`,
        CUSTOMER_ID: `${createModuleDto.customer_id}`,
        CREATED_BY: createModuleDto.created_by,
      });

      return {
        statuscode: HttpStatus.CREATED,
        message: 'Module created successfully',
        data: createModuleDto,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: error,
      };
    }
  }

  async UpdateModule(
    // currentUser: CurrentUserDto,
    updateModuleDto: UpdateModuleMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      updateModuleDto.changed_on = new Date();
      updateModuleDto.changed_by = 2;

      if (updateModuleDto.display_module_name) {
        const whereClause = cds.parse.expr(
          `ID != '${updateModuleDto.id}' AND DISPLAY_MODULE_NAME = '${updateModuleDto.display_module_name.toUpperCase()}' AND IS_ACTIVE = 'Y'`,
        );

        const existingModule = await db
          .read('PCF_DB_MODULE_MASTER')
          .where(whereClause);

        if (existingModule && existingModule.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'Module already exists',
            data: existingModule,
          };
        }
      }

      const updatedModule = await UPDATE('PCF_DB_MODULE_MASTER')
        .set({
          MODULE_NAME: updateModuleDto.module_name,
          MODULE_DESC: updateModuleDto.module_desc,
          DISPLAY_MODULE_NAME: updateModuleDto.display_module_name,
          CHANGED_ON: updateModuleDto.changed_on.toISOString().slice(0, 23),
          CHANGED_BY: updateModuleDto.changed_by,
        })
        .where({
          ID: updateModuleDto.id,
          CUSTOMER_ID: updateModuleDto.customer_id,
          IS_ACTIVE: 'Y',
        });

      return {
        statuscode: HttpStatus.OK,
        message: 'Module updated successfully',
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

  async GetModule(
    // currentUser: CurrentUserDto,
    id,
    customer_id,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      const whereClause = cds.parse.expr(
        `ID = '${Number(id)}' AND IS_ACTIVE = 'Y'`,
      );

      const module = await db.read('PCF_DB_MODULE_MASTER').where(whereClause);

      if (!module || module.length === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'Module not found',
          data: module,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: 'Module fetched successfully',
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

  async DeleteModule(
    // currentUser: CurrentUserDto,
    deleteModuleMaster: DeleteModuleMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      deleteModuleMaster.changed_on = new Date();
      deleteModuleMaster.changed_by = 3;

      const affectedRows = await UPDATE('PCF_DB_MODULE_MASTER')
        .set({
          IS_ACTIVE: 'N',
          CHANGED_ON: deleteModuleMaster.changed_on.toISOString(),
          CHANGED_BY: deleteModuleMaster.changed_by
        })
        .where({
          ID: deleteModuleMaster.id,
          CUSTOMER_ID: deleteModuleMaster.customer_id,
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

  async GetAllModules() // currentUser: CurrentUserDto,
  : Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      const whereClause = cds.parse.expr(`IS_ACTIVE = 'Y'`);

      const modules = await db.read('PCF_DB_MODULE_MASTER').where(whereClause);

      if (!modules || modules.length === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'No modules found',
          data: modules,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: 'Modules fetched successfully',
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
