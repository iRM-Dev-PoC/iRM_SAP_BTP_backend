import {
  HttpStatus,
  Injectable,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { CurrentUserDto, ResponseDto } from '@app/share_lib/common.dto';
import {
  CreateAssignRolePrivilegeDto,
  CreateAssignRoleToUserDto,
  DeleteRoleFromUserDto,
  GetRoleModuleSubmodulePrivilegeMappingDto,
  GetRoleOfUserDto,
  UpdateRoleModuleSubmodulePrivilegeMappingDto,
  UpdateRoleOfUserDto,
} from './dto/assign_role_privilege.dto';
import cds from '@sap/cds';
import { get } from 'http';

@Injectable()
@UsePipes(new ValidationPipe())
@UseGuards(JwtAuthGuard)
export class AssignRolePrivilegeService {
  constructor() {}

  async InsertRoleModuleSubmodulePrivilegeMapping(
    currentUser: CurrentUserDto,
    createRoleModuleSubmodulePrivilegeMappingDto: CreateAssignRolePrivilegeDto,
  ): Promise<ResponseDto> {
    let tx = cds.transaction();
    try {
      createRoleModuleSubmodulePrivilegeMappingDto.created_on = new Date();
      createRoleModuleSubmodulePrivilegeMappingDto.created_by =
        currentUser.user_id;
      console.log(createRoleModuleSubmodulePrivilegeMappingDto);

      if (
        createRoleModuleSubmodulePrivilegeMappingDto.role_id_id &&
        createRoleModuleSubmodulePrivilegeMappingDto.module_id_id &&
        createRoleModuleSubmodulePrivilegeMappingDto.submodule_id_id &&
        createRoleModuleSubmodulePrivilegeMappingDto.privilege_id_id
      ) {
        let exisingRoleModuleSubmodulePrivilegeMapping = await tx.run(
          SELECT.from('PCF_DB_ROLE_MODULE_SUBMODULE_MAPPING')
            .where(`ROLE_ID_ID ='${createRoleModuleSubmodulePrivilegeMappingDto.role_id_id}'
           AND MODULE_ID_ID ='${createRoleModuleSubmodulePrivilegeMappingDto.module_id_id}'
            AND SUBMODULE_ID_ID ='${createRoleModuleSubmodulePrivilegeMappingDto.submodule_id_id}'
            AND PRIVILEGE_ID_ID= '${createRoleModuleSubmodulePrivilegeMappingDto.privilege_id_id}'
            AND CUSTOMER_ID_ID='${createRoleModuleSubmodulePrivilegeMappingDto.customer_id_id}'
            AND IS_ACTIVE='Y'`),
        );
        console.log(exisingRoleModuleSubmodulePrivilegeMapping);
        if (exisingRoleModuleSubmodulePrivilegeMapping.length > 0) {
          await tx.commit();
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'this map is  already exists',
            data: exisingRoleModuleSubmodulePrivilegeMapping,
          };
        }
      }

      let result = await tx.run(
        INSERT.into('PCF_DB_ROLE_MODULE_SUBMODULE_MAPPING').entries(
          createRoleModuleSubmodulePrivilegeMappingDto,
        ),
      );
      console.log(result);

      if (result) {
        await tx.commit();
        return {
          statuscode: HttpStatus.CREATED,
          message: 'Role Module Submodule Privilege  mapped successfully',
          data: createRoleModuleSubmodulePrivilegeMappingDto,
        };
      } else {
        await tx.rollback();
        return {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Role Module Submodule Privilege  mapping failed',
          data: null,
        };
      }
    } catch (error) {
      await tx.rollback();
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async GetRoleModuleSubmodulePrivilegeMapping(
    currentUser: CurrentUserDto,
    getRoleModuleSubmodulePrivilegeMappingDto: GetRoleModuleSubmodulePrivilegeMappingDto,
  ): Promise<ResponseDto> {
    let tx = cds.transaction();
    try {
      let result = await tx.run(
        SELECT.from('PCF_DB_ROLE_MODULE_SUBMODULE_MAPPING').where(
          `id ='${getRoleModuleSubmodulePrivilegeMappingDto.id}' and customer_id_id='${getRoleModuleSubmodulePrivilegeMappingDto.customer_id_id}' and is_active='Y'`,
        ),
      );
      // console.log(result);
      if (result.length > 0) {
        await tx.commit();
        return {
          statuscode: HttpStatus.OK,
          message: 'Role Module Submodule Privilege  fetched successfully',
          data: result,
        };
      } else {
        await tx.rollback();
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'Role Module Submodule Privilege  mapping not found',
          data: null,
        };
      }
    } catch (error) {
      await tx.rollback();
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async UpdateRoleModuleSubmodulePrivilegeMapping(
    currentUser: CurrentUserDto,
    updateRoleModuleSubmodulePrivilegeMappingDto: UpdateRoleModuleSubmodulePrivilegeMappingDto,
  ): Promise<ResponseDto> {
    let tx = cds.transaction();
    try {
      let exisingRoleModuleSubmodulePrivilegeMapping = await tx.run(
        SELECT.from('PCF_DB_ROLE_MODULE_SUBMODULE_MAPPING')
          .where(`ROLE_ID_ID ='${updateRoleModuleSubmodulePrivilegeMappingDto.role_id_id}'
             AND MODULE_ID_ID ='${updateRoleModuleSubmodulePrivilegeMappingDto.module_id_id}'
              AND SUBMODULE_ID_ID ='${updateRoleModuleSubmodulePrivilegeMappingDto.submodule_id_id}'
              AND PRIVILEGE_ID_ID= '${updateRoleModuleSubmodulePrivilegeMappingDto.privilege_id_id}'
              AND CUSTOMER_ID_ID='${updateRoleModuleSubmodulePrivilegeMappingDto.customer_id_id}'
              AND IS_ACTIVE='Y'`),
      );

      if (exisingRoleModuleSubmodulePrivilegeMapping.length > 0) {
        await tx.commit();
        return {
          statuscode: HttpStatus.CONFLICT,
          message: 'this map is  already exists',
          data: exisingRoleModuleSubmodulePrivilegeMapping,
        };
      }

      let result = await tx.run(
        UPDATE('PCF_DB_ROLE_MODULE_SUBMODULE_MAPPING')
          .set({
            ROLE_ID_ID: updateRoleModuleSubmodulePrivilegeMappingDto.role_id_id,
            MODULE_ID_ID:
              updateRoleModuleSubmodulePrivilegeMappingDto.module_id_id,
            SUBMODULE_ID_ID:
              updateRoleModuleSubmodulePrivilegeMappingDto.submodule_id_id,
            PRIVILEGE_ID_ID:
              updateRoleModuleSubmodulePrivilegeMappingDto.privilege_id_id,
            CHANGED_ON: new Date(),
            CHANGED_BY: currentUser.user_id,
          })
          .where(
            `id ='${updateRoleModuleSubmodulePrivilegeMappingDto.id}' and customer_id_id='${updateRoleModuleSubmodulePrivilegeMappingDto.customer_id_id}' and is_active='Y'`,
          ),
      );
      // console.log(result);
      if (result) {
        await tx.commit();
        return {
          statuscode: HttpStatus.OK,
          message: 'Role Module Submodule Privilege  updated successfully',
          data: updateRoleModuleSubmodulePrivilegeMappingDto,
        };
      } else {
        await tx.rollback();
        return {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Role Module Submodule Privilege  update failed',
          data: null,
        };
      }
    } catch (error) {
      await tx.rollback();
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async DeleteRoleModuleSubmodulePrivilegeMapping(
    currentUser: CurrentUserDto,
    id: string,
    customer_id_id: string,
  ): Promise<ResponseDto> {
    let tx = cds.transaction();
    try {
      let result = await tx.run(
        UPDATE('PCF_DB_ROLE_MODULE_SUBMODULE_MAPPING')
          .set({
            IS_ACTIVE: 'N',
            CHANGED_ON: new Date(),
            CHANGED_BY: currentUser.user_id,
          })
          .where(`id ='${id}' and customer_id_id='${customer_id_id}'`),
      );
      // console.log(result);
      if (result) {
        await tx.commit();
        return {
          statuscode: HttpStatus.OK,
          message: 'Role Module Submodule Privilege  deleted successfully',
          data: result,
        };
      } else {
        await tx.rollback();
        return {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Role Module Submodule Privilege  delete failed',
          data: null,
        };
      }
    } catch (error) {
      await tx.rollback();
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }
  //role assign to user
  async AssignRoleToUser(
    currentUser: CurrentUserDto,
    createAssignRoleToUserDto: CreateAssignRoleToUserDto,
  ) {
    let tx = cds.transaction();
    try {
      let exisingRoleModuleSubmodulePrivilegeMapping = await tx.run(
        SELECT.from('PCF_DB_USER_ROLE_MAPPING')
          .where(`ROLE_ID_ID ='${createAssignRoleToUserDto.role_id_id}'
              AND USER_ID_ID ='${createAssignRoleToUserDto.user_id_id}'
             AND CUSTOMER_ID_ID ='${createAssignRoleToUserDto.customer_id_id}'
              AND IS_ACTIVE='Y'`),
      );

      if (exisingRoleModuleSubmodulePrivilegeMapping.length > 0) {
        await tx.commit();
        return {
          statuscode: HttpStatus.CONFLICT,
          message: 'this role is  already assigned to user',
          data: exisingRoleModuleSubmodulePrivilegeMapping,
        };
      }

      createAssignRoleToUserDto.created_on = new Date();
      createAssignRoleToUserDto.created_by = currentUser.user_id;

      let result = await tx.run(
        INSERT.into('PCF_DB_USER_ROLE_MAPPING').entries(
          createAssignRoleToUserDto,
        ),
      );
      // console.log(result);

      if (result) {
        await tx.commit();
        return {
          statuscode: HttpStatus.CREATED,
          message: 'Role  assigned to user successfully',
          data: createAssignRoleToUserDto,
        };
      } else {
        await tx.rollback();
        return {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Role  assigned to user failed',
          data: null,
        };
      }
    } catch (error) {
      await tx.rollback();
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async GetRoleOfUser(
    currentUser: CurrentUserDto,
    getRoleOfUserDto: GetRoleOfUserDto,
  ) {
    let tx = cds.transaction();
    try {
      let result = await tx.run(
        `SELECT USER_ID_ID,(SELECT USER_EMAIL FROM PCF_DB_LOGIN_USER WHERE ID=USER_ID_ID),ROLE_ID_ID,(SELECT ROLE_NAME FROM PCF_DB_ROLE_MASTER WHERE ID=ROLE_ID_ID) FROM PCF_DB_USER_ROLE_MAPPING WHERE USER_ID_ID='${getRoleOfUserDto.user_id_id}' AND CUSTOMER_ID_ID='${currentUser.customer_id}' AND IS_ACTIVE='Y'`,
      );
      // console.log(result);
      if (result.length > 0) {
        await tx.commit();
        return {
          statuscode: HttpStatus.OK,
          message: 'Role  fetched successfully',
          data: result,
        };
      } else {
        await tx.rollback();
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'Role  not found',
          data: null,
        };
      }
    } catch (error) {
      await tx.rollback();
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async UpdateRoleOfUser(
    currentUser: CurrentUserDto,
    updateRoleOfUserDto: UpdateRoleOfUserDto,
  ) {
    let tx = cds.transaction();
    try {
      let exisingresult = await tx.run(
        SELECT.from('PCF_DB_USER_ROLE_MAPPING').where(
          `USER_ID_ID ='${updateRoleOfUserDto.user_id_id}' AND ROLE_ID_ID='${updateRoleOfUserDto.role_id_id}' AND CUSTOMER_ID_ID='${updateRoleOfUserDto.customer_id_id}' AND IS_ACTIVE='Y'`,
        ),
      );

      if (exisingresult.length > 0) {
        await tx.commit();
        return {
          statuscode: HttpStatus.CONFLICT,
          message: 'this role is  already assigned to this user',
          data: exisingresult,
        };
      }

      let result = await tx.run(
        UPDATE('PCF_DB_USER_ROLE_MAPPING')
          .set({
            ROLE_ID_ID: updateRoleOfUserDto.role_id_id,
            CHANGED_ON: new Date(),
            CHANGED_BY: currentUser.user_id,
          })
          .where(
            `USER_ID_ID ='${updateRoleOfUserDto.user_id_id}' AND CUSTOMER_ID_ID='${updateRoleOfUserDto.customer_id_id}' AND IS_ACTIVE='Y'`,
          ),
      );
      // console.log(result);
      if (result) {
        await tx.commit();
        return {
          statuscode: HttpStatus.OK,
          message: 'Role  updated successfully',
          data: updateRoleOfUserDto,
        };
      } else {
        await tx.rollback();
        return {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Role  update failed',
          data: null,
        };
      }
    } catch (error) {
      await tx.rollback();
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }
  async RemoveRoleFromUser(currentUser:CurrentUserDto,
    deleteRoleFromUserDto:DeleteRoleFromUserDto){
      let tx = cds.transaction();
      try {
        let result = await tx.run(
          UPDATE('PCF_DB_USER_ROLE_MAPPING')
            .set({
              IS_ACTIVE: 'N',
              CHANGED_ON: new Date(),
              CHANGED_BY: currentUser.user_id,
            })
            .where(`USER_ID_ID ='${deleteRoleFromUserDto.user_id_id}' AND ROLE_ID_ID='${deleteRoleFromUserDto.role_id_id}' AND CUSTOMER_ID_ID='${deleteRoleFromUserDto.customer_id_id}' AND IS_ACTIVE='Y'`),
        );
        // console.log(result);
        if (result) {
          await tx.commit();
          return {
            statuscode: HttpStatus.OK,
            message: 'Role  removed successfully',
            data: result,
          };
        } else {
          await tx.rollback();
          return {
            statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Role  remove failed',
            data: null,
          };
        }
      } catch (error) {
        await tx.rollback();
        return {
          statuscode: error.status,
          message: error.message,
          data: null,
        };
      }

  }
}
