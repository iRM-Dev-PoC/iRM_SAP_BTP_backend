import { CurrentUserDto, ResponseDto } from '@app/share_lib/common.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateSubModuleMasterDto,
  DeleteSubModuleMasterDto,
  UpdateSubModuleMasterDto,
} from './dto/submoduleMaster.dto';
import cds from '@sap/cds';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '@app/share_lib/database/database.service';
import { AppService } from '../app.service';

@Injectable()
export class SubmoduleMasterService {
  constructor(
    private databaseService: DatabaseService,
    private readonly appService: AppService,
  ) {}

  // async CreateSubModule(
  //   currentUser: CurrentUserDto,
  //   createSubModule: CreateSubModuleMasterDto,
  // ): Promise<ResponseDto> {
  //   let tx = cds.transaction();

  //   try {
  //     createSubModule.submodule_id = uuidv4();
  //     createSubModule.created_on = new Date();
  //     createSubModule.created_by = currentUser.user_id;
  //     createSubModule.submodule_name =
  //       createSubModule.submodule_name.toUpperCase();
  //     createSubModule.display_submodule_name =
  //       createSubModule.display_submodule_name.toUpperCase();
  //     if (
  //       createSubModule.submodule_name ||
  //       createSubModule.display_submodule_name
  //     ) {
  //       let exisingSubModule = await tx.run(
  //         SELECT.from('PCF_DB_SUBMODULE_MASTER')
  //           .columns('submodule_name', 'display_submodule_name', 'is_active')
  //           .where(
  //             `submodule_name = '${createSubModule.submodule_name}' OR display_submodule_name = '${createSubModule.display_submodule_name}' and is_active = 'Y'`,
  //           ),
  //       );
  //       // console.log('exisingModule', exisingModule);
  //       if (exisingSubModule && exisingSubModule.length > 0) {
  //         await tx.commit();
  //         return {
  //           statuscode: HttpStatus.CONFLICT,
  //           message: 'SubModule already exists',
  //           data: exisingSubModule,
  //         };
  //       }
  //     }

  //     let result = await tx.run(
  //       INSERT.into('PCF_DB_SUBMODULE_MASTER').entries(createSubModule),
  //     );
  //     if (!result || result == 0) {
  //       await tx.commit();
  //       return {
  //         statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
  //         message: 'Submodule creation failed',
  //         data: result,
  //       };
  //     }
  //     await tx.commit();
  //     return {
  //       statuscode: HttpStatus.CREATED,
  //       message: 'Submodule created successfully',
  //       data: createSubModule,
  //     };
  //   } catch (error) {
  //     await tx.rollback();
  //     return {
  //       statuscode: 500,
  //       message: 'Error while creating submodule',
  //       data: error,
  //     };
  //   }
  // }

  async CreateSubModule(
    // currentUser: CurrentUserDto,
    createSubModule: CreateSubModuleMasterDto,
  ): Promise<ResponseDto> {
    const hanaOptions = this.databaseService.getHanaOptions();
    try {
      const tableName = 'PCF_DB_SUBMODULE_MASTER';
      const nextUserId = await this.appService.getLastUserId(tableName);

      createSubModule.id = nextUserId;
      createSubModule.submodule_id = uuidv4();
      createSubModule.created_on = new Date();
      createSubModule.created_by = '1';
      createSubModule.submodule_name.toUpperCase();
      createSubModule.display_submodule_name.toUpperCase();

      if (
        createSubModule.submodule_name ||
        createSubModule.display_submodule_name
      ) {
        let existingSubModule = await this.databaseService.executeQuery(
          `SELECT submodule_name, display_submodule_name, is_active FROM ${hanaOptions.schema}.PCF_DB_SUBMODULE_MASTER WHERE submodule_name = '${createSubModule.submodule_name}' OR display_submodule_name = '${createSubModule.display_submodule_name}' AND is_active = 'Y'`,
          hanaOptions,
        );

        if (existingSubModule && existingSubModule.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'SubModule already exists',
            data: existingSubModule,
          };
        }
      }

      let result = await this.databaseService.executeQuery(
        `INSERT INTO ${hanaOptions.schema}.PCF_DB_SUBMODULE_MASTER (id, submodule_id, submodule_name, display_submodule_name, submodule_desc, created_on, created_by, is_active) VALUES ('${createSubModule.id}', '${createSubModule.submodule_id}', '${createSubModule.submodule_name}', '${createSubModule.display_submodule_name}', '${createSubModule.submodule_desc}', TO_TIMESTAMP('${createSubModule.created_on.toISOString().slice(0, 23)}', 'YYYY-MM-DD"T"HH24:MI:SS.FF9'), '${createSubModule.created_by}', 'Y')`,
        hanaOptions,
      );

      if (!result || result === 0) {
        return {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Submodule creation failed',
          data: result,
        };
      }

      return {
        statuscode: HttpStatus.CREATED,
        message: 'Submodule created successfully',
        data: createSubModule,
      };
    } catch (error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error while creating submodule',
        data: error,
      };
    }
  }

  // async UpdateSubModule(
  //   currentUser: CurrentUserDto,
  //   updateSubModule: UpdateSubModuleMasterDto,
  // ): Promise<ResponseDto> {
  //   let tx = cds.transaction();
  //   try {
  //     updateSubModule.changed_on = new Date();
  //     updateSubModule.changed_by = currentUser.user_id;

  //     if (updateSubModule.display_submodule_name) {
  //       let exisingSubModule = await tx.run(
  //         SELECT.from('PCF_DB_SUBMODULE_MASTER')
  //           .columns('submodule_name', 'display_submodule_name', 'is_active')
  //           .where(
  //             `id !='${updateSubModule.id}' and display_submodule_name = '${updateSubModule.display_submodule_name.toUpperCase()}' and is_active = 'Y'`,
  //           ),
  //       );
  //       // console.log('exisingSubModule', exisingSubModule);
  //       if (exisingSubModule && exisingSubModule.length > 0) {
  //         await tx.commit();
  //         return {
  //           statuscode: HttpStatus.CONFLICT,
  //           message: 'SubModule already exists',
  //           data: exisingSubModule,
  //         };
  //       }
  //     }

  //     let result = await tx.run(
  //       UPDATE('PCF_DB_SUBMODULE_MASTER')
  //         .set({
  //           submodule_id: updateSubModule.submodule_id,
  //           submodule_desc: updateSubModule.submodule_desc,
  //           parent_module_id_id: updateSubModule.parent_module_id_id,
  //           display_submodule_name: updateSubModule.display_submodule_name,
  //           changed_on: updateSubModule.changed_on,
  //           changed_by: updateSubModule.changed_by,
  //         })
  //         .where(
  //           `id = '${updateSubModule.id}' and is_active = 'Y' and customer_id_id = '${updateSubModule.customer_id_id}'`,
  //         ),
  //     );
  //     await tx.commit();
  //     return {
  //       statuscode: HttpStatus.OK,
  //       message: 'Submodule updated successfully',
  //       data: updateSubModule,
  //     };
  //   } catch (error) {
  //     await tx.rollback();
  //     return {
  //       statuscode: 500,
  //       message: 'Error while updating submodule',
  //       data: error,
  //     };
  //   }
  // }

  async UpdateSubModule(
    // currentUser: CurrentUserDto,
    updateSubModule: UpdateSubModuleMasterDto,
  ): Promise<ResponseDto> {
    const hanaOptions = this.databaseService.getHanaOptions();
    try {
      updateSubModule.changed_on = new Date();
      updateSubModule.changed_by = '2';

      if (updateSubModule.display_submodule_name) {
        let exisingSubModule = await this.databaseService.executeQuery(
          `SELECT submodule_name, display_submodule_name, is_active FROM ${hanaOptions.schema}.PCF_DB_SUBMODULE_MASTER WHERE id != '${updateSubModule.id}' AND display_submodule_name = '${updateSubModule.display_submodule_name.toUpperCase()}' AND is_active = 'Y'`,
          hanaOptions,
        );

        if (exisingSubModule && exisingSubModule.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'SubModule already exists',
            data: exisingSubModule,
          };
        }
      }

      let result = await this.databaseService.executeQuery(
        `UPDATE ${hanaOptions.schema}.PCF_DB_SUBMODULE_MASTER
         SET
            submodule_name = '${updateSubModule.submodule_name}',
            submodule_desc = '${updateSubModule.submodule_desc}',
            display_submodule_name = '${updateSubModule.display_submodule_name}',
            changed_on = TO_TIMESTAMP('${updateSubModule.changed_on.toISOString().slice(0, 23)}', 'YYYY-MM-DD"T"HH24:MI:SS.FF9'),
            changed_by = '${updateSubModule.changed_by}'
         WHERE
            id = '${updateSubModule.id}' AND
            is_active = 'Y' `,
        hanaOptions,
      );

      await this.databaseService.executeQuery(`COMMIT`, hanaOptions);

      return {
        statuscode: HttpStatus.OK,
        message: 'Submodule updated successfully',
        data: updateSubModule,
      };
    } catch (error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error while updating submodule',
        data: error,
      };
    }
  }

  // async GetSubModule(id, customer_id): Promise<ResponseDto> {
  //   let tx = cds.transaction();
  //   try {
  //     let result = await tx.run(
  //       SELECT.from('PCF_DB_SUBMODULE_MASTER')
  //         .columns(
  //           'id',
  //           'submodule_id',
  //           'submodule_desc',
  //           'parent_module_id_id',
  //           'display_submodule_name',
  //           'customer_id_id',
  //           'created_on',
  //           'created_by',
  //           'changed_on',
  //           'changed_by',
  //         )
  //         .where(
  //           `id='${Number(id)}' and customer_id_id='${Number(customer_id)}' and is_active = 'Y'`,
  //         ),
  //     );
  //     if (!result || result.length == 0) {
  //       await tx.commit();
  //       return {
  //         statuscode: HttpStatus.NOT_FOUND,
  //         message: 'Submodule not found',
  //         data: result,
  //       };
  //     }
  //     await tx.commit();
  //     return {
  //       statuscode: HttpStatus.OK,
  //       message: 'Submodule fetched successfully',
  //       data: result,
  //     };
  //   } catch (error) {
  //     await tx.rollback();
  //     return {
  //       statuscode: 500,
  //       message: 'Error while fetching submodule',
  //       data: error,
  //     };
  //   }
  // }

  async GetSubModule(id: number, customer_id: number): Promise<ResponseDto> {
    const hanaOptions = this.databaseService.getHanaOptions();
    try {
      const result = await this.databaseService.executeQuery(
        `SELECT 
                id, 
                submodule_id, 
                submodule_desc, 
                parent_module_id_id, 
                display_submodule_name, 
                customer_id_id, 
                created_on, 
                created_by, 
                changed_on, 
                changed_by 
             FROM 
                ${hanaOptions.schema}.PCF_DB_SUBMODULE_MASTER 
             WHERE 
                id = '${Number(id)}' AND 
                is_active = 'Y'`,
        hanaOptions,
      );

      if (!result || result.length === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'Submodule not found',
          data: result,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: 'Submodule fetched successfully',
        data: result,
      };
    } catch (error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error while fetching submodule',
        data: error,
      };
    }
  }

  // async DeleteSubModule(
  //   currentUser: CurrentUserDto,
  //   deleteSubModule: DeleteSubModuleMasterDto,
  // ): Promise<ResponseDto> {
  //   let tx = cds.transaction();
  //   try {
  //     let result = await tx.run(
  //       UPDATE('PCF_DB_SUBMODULE_MASTER')
  //         .set({
  //           is_active: 'N',
  //           changed_on: new Date(),
  //           changed_by: currentUser.user_id,
  //         })
  //         .where(
  //           `id = '${deleteSubModule.id}' and customer_id_id = '${deleteSubModule.customer_id}' and is_active = 'Y'`,
  //         ),
  //     );
  //     await tx.commit();
  //     if (!result || result == 0) {
  //       return {
  //         statuscode: HttpStatus.NOT_FOUND,
  //         message: 'Submodule not found for delete',
  //         data: result,
  //       };
  //     }
  //     return {
  //       statuscode: HttpStatus.OK,
  //       message: 'Submodule deleted successfully',
  //       data: result,
  //     };
  //   } catch (error) {
  //     await tx.rollback();
  //     return {
  //       statuscode: 500,
  //       message: 'Error while deleting submodule',
  //       data: error,
  //     };
  //   }
  // }

  async DeleteSubModule(
    // currentUser: CurrentUserDto,
    deleteSubModule: DeleteSubModuleMasterDto,
  ): Promise<ResponseDto> {
    const hanaOptions = this.databaseService.getHanaOptions();
    try {
      let query = `
        DELETE FROM ${hanaOptions.schema}.PCF_DB_SUBMODULE_MASTER
        WHERE
          id = '${deleteSubModule.id}' AND
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

  async GetAllSubModules() // currentUser: CurrentUserDto,
  : Promise<ResponseDto> {
    const hanaOptions = this.databaseService.getHanaOptions();
    try {
      let query = `SELECT * FROM ${hanaOptions.schema}.PCF_DB_SUBMODULE_MASTER`;

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
