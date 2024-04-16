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
    // const hanaOptions = this.databaseService.getHanaOptions();
    try {
      const db = await cds.connect.to('db');

      const tableName = 'PCF_DB_MODULE_MASTER';
      // const nextUserId = await this.appService.getLastUserId(tableName);

      // createModuleDto.id = nextUserId;
      createModuleDto.created_by = 1;
      createModuleDto.module_name = createModuleDto.module_name.toUpperCase();
      createModuleDto.display_module_name =
        createModuleDto.display_module_name.toUpperCase();

      // Checking if module name or display name already exist
      if (createModuleDto.module_name || createModuleDto.display_module_name) {
        // let existingModule = await this.databaseService.executeQuery(
        //   `SELECT module_name, display_module_name, is_active FROM ${hanaOptions.schema}.PCF_DB_MODULE_MASTER WHERE module_name = '${createModuleDto.module_name}' OR display_module_name = '${createModuleDto.display_module_name}' AND is_active = 'Y'`,
        //   hanaOptions,
        // );
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

      // Constructing the INSERT query
      // let query = `
      //   INSERT INTO ${hanaOptions.schema}.PCF_DB_MODULE_MASTER (ID, module_id, module_name, module_desc, display_module_name, created_on, created_by, is_active)
      //   VALUES ('${createModuleDto.id}', '${createModuleDto.module_id}', '${createModuleDto.module_name}', '${createModuleDto.module_desc}', '${createModuleDto.display_module_name}', TO_TIMESTAMP('${createModuleDto.created_on.toISOString().slice(0, 23)}', 'YYYY-MM-DD"T"HH24:MI:SS.FF9'), '${createModuleDto.created_by}', 'Y')
      // `;

      const createdModule = await INSERT.into(tableName).entries({
        MODULE_NAME: `${createModuleDto.module_name}`,
        MODULE_DESC: `${createModuleDto.module_desc}`,
        DISPLAY_MODULE_NAME: `${createModuleDto.display_module_name}`,
        CUSTOMER_ID: `${createModuleDto.customer_id}`,
        CREATED_BY: createModuleDto.created_by,
      });

      // Executing the INSERT query
      // await this.databaseService.executeQuery(query, hanaOptions);

      return {
        statuscode: HttpStatus.CREATED,
        message: 'Module created successfully',
        data: createModuleDto,
        // data: createdModule,
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
          MODULE_DESC: updateModuleDto.module_desc,
          DISPLAY_MODULE_NAME: updateModuleDto.display_module_name,
          CHANGED_ON: updateModuleDto.changed_on.toISOString().slice(0, 23),
          CHANGED_BY: updateModuleDto.changed_by,
        })
        .where({
          ID: updateModuleDto.id,
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

  // async GetModule(
  //   // currentUser: CurrentUserDto,
  //   id,
  //   customer_id,
  // ): Promise<ResponseDto> {
  //   const hanaOptions = this.databaseService.getHanaOptions();
  //   try {
  //     let query = `
  //       SELECT
  //         *
  //       FROM ${hanaOptions.schema}.PCF_DB_MODULE_MASTER
  //       WHERE
  //         id = '${Number(id)}' AND
  //         is_active = 'Y'
  //     `;

  //     let module = await this.databaseService.executeQuery(query, hanaOptions);

  //     if (!module || module.length == 0) {
  //       return {
  //         statuscode: HttpStatus.NOT_FOUND,
  //         message: 'Module not found',
  //         data: module,
  //       };
  //     }

  //     return {
  //       statuscode: HttpStatus.OK,
  //       message: 'Module fetched successfully',
  //       data: module,
  //     };
  //   } catch (error) {
  //     return {
  //       statuscode: error.status,
  //       message: error.message,
  //       data: null,
  //     };
  //   }
  // }

  async GetModule(
    // currentUser: CurrentUserDto,
    id,
    customer_id,
  ): Promise<ResponseDto> {
    // const hanaOptions = this.databaseService.getHanaOptions();
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
    // const hanaOptions = this.databaseService.getHanaOptions();
    try {
      const db = await cds.connect.to('db');

      const affectedRows = await UPDATE('PCF_DB_MODULE_MASTER')
        .set({ IS_ACTIVE: 'N' })
        .where({
          ID: deleteModuleMaster.id,
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
    // const hanaOptions = this.databaseService.getHanaOptions(); // Getting HANA options
    try {
      const db = await cds.connect.to('db');
      // let query = `SELECT * FROM ${hanaOptions.schema}.PCF_DB_MODULE_MASTER`;

      // let modules = await this.databaseService.executeQuery(query, hanaOptions);

      const modules = await db.read('PCF_DB_MODULE_MASTER');

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
