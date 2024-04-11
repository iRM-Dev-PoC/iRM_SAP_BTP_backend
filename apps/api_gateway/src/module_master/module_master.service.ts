import { CurrentUserDto, ResponseDto } from '@app/share_lib/common.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import cds from '@sap/cds';
import { v4 as uuidv4 } from 'uuid';
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
  // async CreateModule(
  //   currentUser: CurrentUserDto,
  //   createModuleDto: CreateModuleMasterDto,
  // ): Promise<ResponseDto> {
  //   let tx = cds.transaction();
  //   try {
  //     createModuleDto.module_id = uuidv4();
  //     createModuleDto.created_on = new Date();
  //     createModuleDto.created_by = currentUser.user_id;
  //     createModuleDto.module_name = createModuleDto.module_name.toUpperCase();
  //     createModuleDto.display_module_name =
  //       createModuleDto.display_module_name.toUpperCase();
  //     if (createModuleDto.module_name || createModuleDto.display_module_name) {
  //       let exisingModule = await tx.run(
  //         SELECT.from('PCF_DB_MODULE_MASTER')
  //           .columns('module_name', 'display_module_name', 'is_active')
  //           .where(
  //             `module_name = '${createModuleDto.module_name}' OR display_module_name = '${createModuleDto.display_module_name}' and is_active = 'Y'`,
  //           ),
  //       );
  //       // console.log('exisingModule', exisingModule);
  //       if (exisingModule && exisingModule.length > 0) {
  //         await tx.commit();
  //         return {
  //           statuscode: HttpStatus.CONFLICT,
  //           message: 'Module already exists',
  //           data: exisingModule,
  //         };
  //       }
  //     }
  //     let user = await tx.run(
  //       INSERT.into('PCF_DB_MODULE_MASTER').entries(createModuleDto),
  //     );
  //     await tx.commit();
  //     return {
  //       statuscode: HttpStatus.CREATED,
  //       message: 'module created successfully',
  //       data: createModuleDto,
  //     };
  //   } catch (error) {
  //     await tx.rollback();
  //     return {
  //       statuscode: error.status,
  //       message: error.message,
  //       data: null,
  //     };
  //   }
  // }

  async CreateModule(
    // currentUser: CurrentUserDto,
    createModuleDto: CreateModuleMasterDto,
  ): Promise<ResponseDto> {
    const hanaOptions = this.databaseService.getHanaOptions(); // Getting HANA options
    try {
      const tableName = 'PCF_DB_MODULE_MASTER';
      const nextUserId = await this.appService.getLastUserId(tableName);

      createModuleDto.id = nextUserId;
      createModuleDto.module_id = uuidv4();
      createModuleDto.created_on = new Date();
      createModuleDto.created_by = '1';
      createModuleDto.module_name = createModuleDto.module_name.toUpperCase();
      createModuleDto.display_module_name =
        createModuleDto.display_module_name.toUpperCase();

      // Checking if module name or display name already exist
      if (createModuleDto.module_name || createModuleDto.display_module_name) {
        let existingModule = await this.databaseService.executeQuery(
          `SELECT module_name, display_module_name, is_active FROM ${hanaOptions.schema}.PCF_DB_MODULE_MASTER WHERE module_name = '${createModuleDto.module_name}' OR display_module_name = '${createModuleDto.display_module_name}' AND is_active = 'Y'`,
          hanaOptions,
        );

        if (existingModule && existingModule.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'Module already exists',
            data: existingModule,
          };
        }
      }

      // Constructing the INSERT query
      let query = `
        INSERT INTO ${hanaOptions.schema}.PCF_DB_MODULE_MASTER (ID, module_id, module_name, module_desc, display_module_name, created_on, created_by, is_active) 
        VALUES ('${createModuleDto.id}', '${createModuleDto.module_id}', '${createModuleDto.module_name}', '${createModuleDto.module_desc}', '${createModuleDto.display_module_name}', TO_TIMESTAMP('${createModuleDto.created_on.toISOString().slice(0, 23)}', 'YYYY-MM-DD"T"HH24:MI:SS.FF9'), '${createModuleDto.created_by}', 'Y')
      `;

      // Executing the INSERT query
      await this.databaseService.executeQuery(query, hanaOptions);

      return {
        statuscode: HttpStatus.CREATED,
        message: 'Module created successfully',
        data: createModuleDto,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  // async UpdateModule(
  //   currentUser: CurrentUserDto,
  //   updateModuleDto: UpdateModuleMasterDto,
  // ): Promise<ResponseDto> {
  //   let tx = cds.transaction();
  //   try {
  //     updateModuleDto.changed_on = new Date();
  //     updateModuleDto.changed_by = currentUser.user_id;

  //     if (updateModuleDto.display_module_name) {
  //       let exisingModule = await tx.run(
  //         SELECT.from('PCF_DB_MODULE_MASTER')
  //           .columns('module_name', 'display_module_name', 'is_active')
  //           .where(
  //             `id !='${updateModuleDto.id}' and display_module_name = '${updateModuleDto.display_module_name.toUpperCase()}' and is_active = 'Y'`,
  //           ),
  //       );
  //       // console.log('exisingModule', exisingModule);
  //       if (exisingModule && exisingModule.length > 0) {
  //         await tx.commit();
  //         return {
  //           statuscode: HttpStatus.CONFLICT,
  //           message: 'Module already exists',
  //           data: exisingModule,
  //         };
  //       }
  //     }

  //     let module = await tx.run(
  //       UPDATE('PCF_DB_MODULE_MASTER')
  //         .set({
  //           module_id: updateModuleDto.module_id,
  //           module_desc: updateModuleDto.module_desc,
  //           parent_module_id_id: updateModuleDto.parent_module_id_id,
  //           display_module_name: updateModuleDto.display_module_name,
  //           customer_id_id: updateModuleDto.customer_id_id,
  //           changed_on: updateModuleDto.changed_on,
  //           changed_by: updateModuleDto.changed_by,
  //         })
  //         .where(
  //           `id = '${updateModuleDto.id}' and is_active = 'Y' and customer_id_id = '${updateModuleDto.customer_id_id}'`,
  //         ),
  //     );
  //     await tx.commit();
  //     return {
  //       statuscode: HttpStatus.OK,
  //       message: 'module updated successfully',
  //       data: updateModuleDto,
  //     };
  //   } catch (error) {
  //     await tx.rollback();
  //     return {
  //       statuscode: error.status,
  //       message: error.message,
  //       data: null,
  //     };
  //   }
  // }

  async UpdateModule(
    // currentUser: CurrentUserDto,
    updateModuleDto: UpdateModuleMasterDto,
  ): Promise<ResponseDto> {
    const hanaOptions = this.databaseService.getHanaOptions(); // Getting HANA options
    try {
      updateModuleDto.changed_on = new Date();
      updateModuleDto.changed_by = '2';

      if (updateModuleDto.display_module_name) {
        let existingModule = await this.databaseService.executeQuery(
          `SELECT module_name, display_module_name, is_active FROM ${hanaOptions.schema}.PCF_DB_MODULE_MASTER WHERE id != '${updateModuleDto.id}' AND display_module_name = '${updateModuleDto.display_module_name.toUpperCase()}' AND is_active = 'Y'`,
          hanaOptions,
        );

        if (existingModule && existingModule.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'Module already exists',
            data: existingModule,
          };
        }
      }

      let query = `
        UPDATE ${hanaOptions.schema}.PCF_DB_MODULE_MASTER
        SET
          module_desc = '${updateModuleDto.module_desc}',
          display_module_name = '${updateModuleDto.display_module_name}',
          changed_on = TO_TIMESTAMP('${updateModuleDto.changed_on.toISOString().slice(0, 23)}', 'YYYY-MM-DD"T"HH24:MI:SS.FF9'),
          changed_by = '${updateModuleDto.changed_by}'
        WHERE
          id = '${updateModuleDto.id}' AND
          is_active = 'Y'
      `;

      await this.databaseService.executeQuery(query, hanaOptions);

      return {
        statuscode: HttpStatus.OK,
        message: 'Module updated successfully',
        data: updateModuleDto,
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
  //   currentUser: CurrentUserDto,
  //   id,
  //   customer_id,
  // ): Promise<ResponseDto> {
  //   try {
  //     let module = await cds.run(
  //       SELECT.from('PCF_DB_MODULE_MASTER')
  //         .columns(
  //           'id',
  //           'module_id',
  //           'module_desc',
  //           'parent_module_id_id',
  //           'display_module_name',
  //           'customer_id_id',
  //           'created_on',
  //           'created_by',
  //           'changed_on',
  //           'changed_by',
  //         )
  //         .where(
  //           `id = '${Number(id)}' and customer_id_id = '${Number(customer_id)}' and is_active = 'Y'`,
  //         ),
  //     );
  //     if (!module || module.length == 0) {
  //       return {
  //         statuscode: HttpStatus.NOT_FOUND,
  //         message: 'module not found',
  //         data: module,
  //       };
  //     }
  //     return {
  //       statuscode: HttpStatus.OK,
  //       message: 'module fetched successfully',
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
    const hanaOptions = this.databaseService.getHanaOptions();
    try {
      let query = `
        SELECT 
          *
        FROM ${hanaOptions.schema}.PCF_DB_MODULE_MASTER
        WHERE 
          id = '${Number(id)}' AND 
          is_active = 'Y'
      `;

      let module = await this.databaseService.executeQuery(query, hanaOptions);

      if (!module || module.length == 0) {
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

  // async DeleteModule(
  //   currentUser: CurrentUserDto,
  //   deleteModuleMaster: DeleteModuleMasterDto,
  // ): Promise<ResponseDto> {
  //   let tx = cds.transaction();
  //   try {
  //     let module = await tx.run(
  //       UPDATE('PCF_DB_MODULE_MASTER')
  //         .set({
  //           is_active: 'N',
  //           changed_on: new Date(),
  //           changed_by: currentUser.user_id,
  //         })
  //         .where(
  //           `id = '${deleteModuleMaster.id}' and customer_id_id = '${deleteModuleMaster.customer_id}' and is_active = 'Y'`,
  //         ),
  //     );
  //     console.log('module', module);
  //     await tx.commit();
  //     if (module == 0) {
  //       return {
  //         statuscode: HttpStatus.NOT_FOUND,
  //         message: 'module not found for deletion',
  //         data: module,
  //       };
  //     }

  //     return {
  //       statuscode: HttpStatus.OK,
  //       message: 'module deleted successfully',
  //       data: module,
  //     };
  //   } catch (error) {
  //     await tx.rollback();
  //     return {
  //       statuscode: error.status,
  //       message: error.message,
  //       data: null,
  //     };
  //   }
  // }

  async DeleteModule(
    // currentUser: CurrentUserDto,
    deleteModuleMaster: DeleteModuleMasterDto,
  ): Promise<ResponseDto> {
    const hanaOptions = this.databaseService.getHanaOptions();
    try {
      let query = `
        DELETE FROM ${hanaOptions.schema}.PCF_DB_MODULE_MASTER
        WHERE
          id = '${deleteModuleMaster.id}' AND
          is_active = 'Y'
      `;

      let module = await this.databaseService.executeQuery(query, hanaOptions);

      if (module === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'Module not found for deletion',
          data: module,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: 'Module deleted successfully',
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

  async GetAllModules(
    // currentUser: CurrentUserDto,
  ): Promise<ResponseDto> {
    const hanaOptions = this.databaseService.getHanaOptions(); // Getting HANA options
    try {
      let query = `SELECT * FROM ${hanaOptions.schema}.PCF_DB_MODULE_MASTER`;

      let modules = await this.databaseService.executeQuery(query, hanaOptions);

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
        data: null,
      };
    }
  }
}
