import { CurrentUserDto, ResponseDto } from '@app/share_lib/common.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleMasterDto, DeleteRoleMasterDto, UpdateRoleMasterDto } from './dto/roleMaster.dto';
import cds from '@sap/cds';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RoleMasterService {
  constructor() {}

  async CreateRoleMaster(
    currentUser: CurrentUserDto,
    createRoleMaster: CreateRoleMasterDto,
  ): Promise<ResponseDto> {
    let tx = cds.transaction();
    try {
      createRoleMaster.role_id = uuidv4();
      createRoleMaster.created_on = new Date();
      createRoleMaster.created_by = currentUser.user_id;
      createRoleMaster.role_name = createRoleMaster.role_name.toUpperCase();
      if (createRoleMaster.role_name) {
        let existingRole = await tx.run(
          SELECT.from('PCF_DB_ROLE_MASTER')
            .columns('role_name', 'role_desc', 'is_active')
            .where(
              `role_name = '${createRoleMaster.role_name}'  and is_active = 'Y'`,
            ),
        );
        if (existingRole && existingRole.length > 0) {
          await tx.commit();
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'Role already exists',
            data: existingRole,
          };
        }
      }
      let result = await tx.run(
        INSERT.into('PCF_DB_ROLE_MASTER').entries(createRoleMaster),
      );
      // console.log('result', result);
      if (!result) {
        await tx.commit();
        return {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Role creation failed',
          data: result,
        };
      }
      await tx.commit();
      return {
        statuscode: HttpStatus.CREATED,
        message: 'Role created successfully',
        data: createRoleMaster,
      };
    } catch (error) {
      await tx.rollback();
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'role creation failed',
        data: error,
      };
    }
  }

  async GetRoleMaster(id, customer_id): Promise<ResponseDto> {
    let tx = cds.transaction();
    try {
      let result = await tx.run(
        SELECT.from('PCF_DB_ROLE_MASTER')
          .columns('role_id', 'role_name', 'role_desc', 'is_active')
          .where(
            `id = '${Number(id)}' and customer_id_id = '${Number(customer_id)}' and is_active = 'Y'`,
          ),
      );
      console.log('result', result);
      if (!result || result.length === 0) {
        await tx.commit();
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'Role not found',
          data: result,
        };
      }
      await tx.commit();
      return {
        statuscode: HttpStatus.OK,
        message: 'Role fetched successfully',
        data: result,
      };
    } catch (error) {
      await tx.rollback();
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Role fetch failed',
        data: error,
      };
    }
  }

  async UpdateRoleMaster(
    currentUser: CurrentUserDto,
    updateRoleMaster: UpdateRoleMasterDto,
  ): Promise<ResponseDto> {
    let tx = cds.transaction();
    try {
      updateRoleMaster.changed_on = new Date();
      updateRoleMaster.changed_by = currentUser.user_id;
      updateRoleMaster.role_name = updateRoleMaster.role_name.toUpperCase();

      if (updateRoleMaster.role_name) {
        let existingRole = await tx.run(
          SELECT.from('PCF_DB_ROLE_MASTER')
            .columns('role_name', 'role_desc', 'is_active')
            .where(
              `id !='${updateRoleMaster.id}' and role_name = '${updateRoleMaster.role_name}' and is_active = 'Y'`,
            ),
        );

        if (existingRole && existingRole.length > 0) {
          await tx.commit();
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'Role already exists',
            data: existingRole,
          };
        }
      }

      let result = await tx.run(
        UPDATE('PCF_DB_ROLE_MASTER')
          .set({
            role_name: updateRoleMaster.role_name,
            role_desc: updateRoleMaster.role_desc,
            changed_on: updateRoleMaster.changed_on,
            changed_by: updateRoleMaster.changed_by,
          })
          .where(
            `id = '${updateRoleMaster.id}' and customer_id_id = '${updateRoleMaster.customer_id_id}' and is_active = 'Y'`,
          ),
      );
      if (!result) {
        await tx.commit();
        return {
          statuscode: HttpStatus.NOT_MODIFIED,
          message: 'Role not updated',
          data: result,
        };
      }
      await tx.commit();
      return {
        statuscode: HttpStatus.OK,
        message: 'Role updated successfully',
        data: updateRoleMaster,
      };
    } catch (error) {
      await tx.rollback();
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Role update failed',
        data: error,
      };
    }
  }


  async DeleteRoleMaster(currentUser: CurrentUserDto, deleteRoleMaster:DeleteRoleMasterDto): Promise<ResponseDto>{

    let tx = cds.transaction();
    try {
      let result = await tx.run(
        UPDATE('PCF_DB_ROLE_MASTER')
          .set({
            is_active: 'N',
            changed_on: new Date(),
            changed_by: currentUser.user_id,
          })
          .where(
            `id = '${deleteRoleMaster.id}' and customer_id_id = '${deleteRoleMaster.customer_id}' and is_active = 'Y'`,
          ),
      );
      if (!result) {
        await tx.commit();
        return {
          statuscode: HttpStatus.NOT_MODIFIED,
          message: 'Role not deleted',
          data: result,
        };
      }
      await tx.commit();
      return {
        statuscode: HttpStatus.OK,
        message: 'Role deleted successfully',
        data: result,
      };
    } catch (error) {
      await tx.rollback();
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Role delete failed',
        data: error,
      };
    }
  }
}
