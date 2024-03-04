import { CurrentUserDto, ResponseDto } from '@app/share_lib/common.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateSubModuleMasterDto,
  DeleteSubModuleMasterDto,
  UpdateSubModuleMasterDto,
} from './dto/submoduleMaster.dto';
import cds from '@sap/cds';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SubmoduleMasterService {
  async CreateSubModule(
    currentUser: CurrentUserDto,
    createSubModule: CreateSubModuleMasterDto,
  ): Promise<ResponseDto> {
    let tx = cds.transaction();

    try {
      createSubModule.submodule_id = uuidv4();
      createSubModule.created_on = new Date();
      createSubModule.created_by = currentUser.user_id;
      createSubModule.submodule_name =
        createSubModule.submodule_name.toUpperCase();
      createSubModule.display_submodule_name =
        createSubModule.display_submodule_name.toUpperCase();
      if (
        createSubModule.submodule_name ||
        createSubModule.display_submodule_name
      ) {
        let exisingSubModule = await tx.run(
          SELECT.from('PCF_DB_SUBMODULE_MASTER')
            .columns('submodule_name', 'display_submodule_name', 'is_active')
            .where(
              `submodule_name = '${createSubModule.submodule_name}' OR display_submodule_name = '${createSubModule.display_submodule_name}' and is_active = 'Y'`,
            ),
        );
        // console.log('exisingModule', exisingModule);
        if (exisingSubModule && exisingSubModule.length > 0) {
          await tx.commit();
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'SubModule already exists',
            data: exisingSubModule,
          };
        }
      }

      let result = await tx.run(
        INSERT.into('PCF_DB_SUBMODULE_MASTER').entries(createSubModule),
      );
      if (!result || result == 0) {
        await tx.commit();
        return {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Submodule creation failed',
          data: result,
        };
      }
      await tx.commit();
      return {
        statuscode: HttpStatus.CREATED,
        message: 'Submodule created successfully',
        data: createSubModule,
      };
    } catch (error) {
      await tx.rollback();
      return {
        statuscode: 500,
        message: 'Error while creating submodule',
        data: error,
      };
    }
  }

  async UpdateSubModule(
    currentUser: CurrentUserDto,
    updateSubModule: UpdateSubModuleMasterDto,
  ): Promise<ResponseDto> {
    let tx = cds.transaction();
    try {
      updateSubModule.changed_on = new Date();
      updateSubModule.changed_by = currentUser.user_id;

      if (updateSubModule.display_submodule_name) {
        let exisingSubModule = await tx.run(
          SELECT.from('PCF_DB_SUBMODULE_MASTER')
            .columns('submodule_name', 'display_submodule_name', 'is_active')
            .where(
              `id !='${updateSubModule.id}' and display_submodule_name = '${updateSubModule.display_submodule_name.toUpperCase()}' and is_active = 'Y'`,
            ),
        );
        // console.log('exisingSubModule', exisingSubModule);
        if (exisingSubModule && exisingSubModule.length > 0) {
          await tx.commit();
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'SubModule already exists',
            data: exisingSubModule,
          };
        }
      }

      let result = await tx.run(
        UPDATE('PCF_DB_SUBMODULE_MASTER')
          .set({
            submodule_id: updateSubModule.submodule_id,
            submodule_desc: updateSubModule.submodule_desc,
            parent_module_id_id: updateSubModule.parent_module_id_id,
            display_submodule_name: updateSubModule.display_submodule_name,
            changed_on: updateSubModule.changed_on,
            changed_by: updateSubModule.changed_by,
          })
          .where(
            `id = '${updateSubModule.id}' and is_active = 'Y' and customer_id_id = '${updateSubModule.customer_id_id}'`,
          ),
      );
      await tx.commit();
      return {
        statuscode: HttpStatus.OK,
        message: 'Submodule updated successfully',
        data: updateSubModule,
      };
    } catch (error) {
      await tx.rollback();
      return {
        statuscode: 500,
        message: 'Error while updating submodule',
        data: error,
      };
    }
  }

  async GetSubModule(id, customer_id): Promise<ResponseDto> {
    let tx = cds.transaction();
    try {
      let result = await tx.run(
        SELECT.from('PCF_DB_SUBMODULE_MASTER')
          .columns(
            'id',
            'submodule_id',
            'submodule_desc',
            'parent_module_id_id',
            'display_submodule_name',
            'customer_id_id',
            'created_on',
            'created_by',
            'changed_on',
            'changed_by',
          )
          .where(
            `id='${Number(id)}' and customer_id_id='${Number(customer_id)}' and is_active = 'Y'`,
          ),
      );
      if (!result || result.length == 0) {
        await tx.commit();
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'Submodule not found',
          data: result,
        };
      }
      await tx.commit();
      return {
        statuscode: HttpStatus.OK,
        message: 'Submodule fetched successfully',
        data: result,
      };
    } catch (error) {
      await tx.rollback();
      return {
        statuscode: 500,
        message: 'Error while fetching submodule',
        data: error,
      };
    }
  }

  async DeleteSubModule(
    currentUser: CurrentUserDto,
    deleteSubModule: DeleteSubModuleMasterDto,
  ): Promise<ResponseDto> {
    let tx = cds.transaction();
    try {
      let result = await tx.run(
        UPDATE('PCF_DB_SUBMODULE_MASTER')
          .set({
            is_active: 'N',
            changed_on: new Date(),
            changed_by: currentUser.user_id,
          })
          .where(
            `id = '${deleteSubModule.id}' and customer_id_id = '${deleteSubModule.customer_id}' and is_active = 'Y'`,
          ),
      );
      await tx.commit();
      if (!result || result == 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'Submodule not found for delete',
          data: result,
        };
      }
      return {
        statuscode: HttpStatus.OK,
        message: 'Submodule deleted successfully',
        data: result,
      };
    } catch (error) {
      await tx.rollback();
      return {
        statuscode: 500,
        message: 'Error while deleting submodule',
        data: error,
      };
    }
  }
}
