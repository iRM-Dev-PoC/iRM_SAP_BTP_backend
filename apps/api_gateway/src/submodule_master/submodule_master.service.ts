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

  async CreateSubModule(
    // currentUser: CurrentUserDto,
    createSubModule: CreateSubModuleMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      createSubModule.created_by = 1;
      createSubModule.submodule_name =
        createSubModule.submodule_name.toUpperCase();
      createSubModule.display_submodule_name =
        createSubModule.display_submodule_name.toUpperCase();

      if (
        createSubModule.submodule_name ||
        createSubModule.display_submodule_name
      ) {
        const whereClause = cds.parse.expr(
          `SUBMODULE_NAME = '${createSubModule.submodule_name}' OR DISPLAY_SUBMODULE_NAME = '${createSubModule.display_submodule_name}' AND IS_ACTIVE = 'Y'`,
        );

        const existingSubModule = await db
          .read('PCF_DB_SUBMODULE_MASTER')
          .where(whereClause);

        if (existingSubModule && existingSubModule.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'SubModule already exists',
            data: existingSubModule,
          };
        }
      }

      const createdSubModule = await INSERT.into(
        'PCF_DB_SUBMODULE_MASTER',
      ).entries({
        SUBMODULE_NAME: `${createSubModule.submodule_name}`,
        DISPLAY_SUBMODULE_NAME: `${createSubModule.display_submodule_name}`,
        SUBMODULE_DESC: `${createSubModule.submodule_desc}`,
        CREATED_BY: createSubModule.created_by,
        CUSTOMER_ID: `${createSubModule.customer_id}`,
        PARENT_MODULE_ID: `${createSubModule.parent_module_id}`,
      });

      if (!createdSubModule || createdSubModule === 0) {
        return {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Submodule creation failed',
          data: createdSubModule,
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

  async UpdateSubModule(
    // currentUser: CurrentUserDto,
    updateSubModule: UpdateSubModuleMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      updateSubModule.changed_on = new Date();
      updateSubModule.changed_by = 2;

      if (updateSubModule.display_submodule_name) {
        const whereClause = cds.parse.expr(
          `ID != '${updateSubModule.id}' AND CUSTOMER_ID ='${updateSubModule.customer_id}' AND DISPLAY_SUBMODULE_NAME = '${updateSubModule.display_submodule_name.toUpperCase()}' AND IS_ACTIVE = 'Y'`,
        );

        const existingSubModule = await db
          .read('PCF_DB_SUBMODULE_MASTER')
          .where(whereClause);

        if (existingSubModule && existingSubModule.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'SubModule already exists',
            data: existingSubModule,
          };
        }
      }

      const updatedSubModule = await UPDATE('PCF_DB_SUBMODULE_MASTER')
        .set({
          SUBMODULE_NAME: updateSubModule.submodule_name,
          SUBMODULE_DESC: updateSubModule.submodule_desc,
          DISPLAY_SUBMODULE_NAME: updateSubModule.display_submodule_name,
          CHANGED_ON: updateSubModule.changed_on.toISOString(),
          CHANGED_BY: updateSubModule.changed_by,
        })
        .where({
          ID: updateSubModule.id,
          CUSTOMER_ID: updateSubModule.customer_id,
          IS_ACTIVE: 'Y',
        });

      await db.run(`COMMIT`);

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

  async GetSubModule(id, customer_id): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      const whereClause = cds.parse.expr(
        `ID = '${Number(id)}' AND IS_ACTIVE = 'Y'`,
      );

      const result = await db.read('PCF_DB_SUBMODULE_MASTER').where(whereClause);

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

  async DeleteSubModule(
    // currentUser: CurrentUserDto,
    deleteSubModule: DeleteSubModuleMasterDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      const affectedRows = await UPDATE('PCF_DB_SUBMODULE_MASTER')
        .set({ IS_ACTIVE: 'N' })
        .where({
          ID: deleteSubModule.id,
          CUSTOMER_ID: deleteSubModule.customer_id,
          IS_ACTIVE: 'Y',
        });

      if (affectedRows === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'Submodule not found for deletion',
          data: null,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: 'Submodule deleted successfully',
        data: affectedRows,
      };
    } catch (error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error while deleting submodule',
        data: error,
      };
    }
  }

  async GetAllSubModules() // currentUser: CurrentUserDto,
  : Promise<ResponseDto> {
    try {
      const db = await cds.connect.to('db');

      const whereClause = cds.parse.expr(`IS_ACTIVE = 'Y'`);

      const submodules = await db
        .read('PCF_DB_SUBMODULE_MASTER')
        .where(whereClause);

      if (!submodules || submodules.length === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'No submodules found',
          data: submodules,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: 'Submodules fetched successfully',
        data: submodules,
      };
    } catch (error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch submodules',
        data: error,
      };
    }
  }
}
