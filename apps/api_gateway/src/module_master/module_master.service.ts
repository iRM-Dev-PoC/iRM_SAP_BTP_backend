import { CurrentUserDto, ResponseDto } from '@app/share_lib/common.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import cds from '@sap/cds';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateModuleMasterDto,
  UpdateModuleMasterDto,
} from './dto/moduleMaster.dto';

@Injectable()
export class ModuleMasterService {
  async CreateModule(
    currentUser: CurrentUserDto,
    createModuleDto: CreateModuleMasterDto,
  ): Promise<ResponseDto> {
    let tx = cds.transaction();
    try {
      createModuleDto.module_id = uuidv4();
      createModuleDto.created_on = new Date();
      createModuleDto.created_by = currentUser.user_id;
      if (createModuleDto.module_name || createModuleDto.display_module_name) {
        let exisingModule = await tx.run(
          SELECT.from('PCF_DB_MODULE_MASTER')
            .columns('module_name', 'display_module_name', 'is_active')
            .where(
              `module_name = '${createModuleDto.module_name}' OR display_module_name = '${createModuleDto.display_module_name}' and is_active = 'Y'`,
            ),
        );
        if (exisingModule && exisingModule.length > 0) {
          await tx.commit();
          return {
            status: HttpStatus.CONFLICT,
            message: 'Module already exists',
            data: exisingModule,
          };
        }
      }
      let user = await tx.run(
        INSERT.into('PCF_DB_MODULE_MASTER').entries(createModuleDto),
      );
      await tx.commit();
      return {
        status: HttpStatus.CREATED,
        message: 'module created successfully',
        data: createModuleDto,
      };
    } catch (error) {
      await tx.rollback();
      return {
        status: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async UpdateModule(
    currentUser: CurrentUserDto,
    updateModuleDto: UpdateModuleMasterDto,
  ): Promise<ResponseDto> {
    let tx = cds.transaction();
    try {
      updateModuleDto.changed_on = new Date();
      updateModuleDto.changed_by = currentUser.user_id;
      let user = await tx.run(
        UPDATE('PCF_DB_MODULE_MASTER').set(updateModuleDto).where({
          module_id: updateModuleDto.id,
        }),
      );
      await tx.commit();
      return {
        status: HttpStatus.OK,
        message: 'module updated successfully',
        data: updateModuleDto,
      };
    } catch (error) {
      await tx.rollback();
      return {
        status: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async DeleteModule(
    currentUser: CurrentUserDto,
    moduleId: string,
  ): Promise<ResponseDto> {
    let tx = cds.transaction();
    try {
      let user = await tx.run(
        UPDATE('PCF_DB_MODULE_MASTER')
          .set({
            is_active: 'N',
            changed_on: new Date(),
            changed_by: currentUser.user_id,
          })
          .where({
            module_id: moduleId,
          }),
      );
      await tx.commit();
      return {
        status: HttpStatus.OK,
        message: 'module deleted successfully',
        data: moduleId,
      };
    } catch (error) {
      await tx.rollback();
      return {
        status: error.status,
        message: error.message,
        data: null,
      };
    }
  }
}
