import { HttpStatus, Injectable } from '@nestjs/common';
import cds from '@sap/cds';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateLoginUserDto,
  DeleteLoginUserDto,
  UpdateLoginUserDto,
} from './dto/loginuser.dto';
import { CurrentUserDto, ResponseDto } from '@app/share_lib/common.dto';

@Injectable()
export class LoginUserService {
  async CreateUser(
    currentUser: CurrentUserDto,
    createUserDto: CreateLoginUserDto,
  ): Promise<ResponseDto> {
    let tx = cds.transaction();
    try {
      createUserDto.user_id = uuidv4();
      createUserDto.created_on = new Date();
      createUserDto.created_by = currentUser.user_id;
      if (createUserDto.user_name || createUserDto.user_email) {
        let exisingUser = await tx.run(
          SELECT.from('PCF_DB_LOGIN_USER')
            .columns('user_name', 'user_email', 'is_active')
            .where(
              `user_name = '${createUserDto.user_name}' OR user_email = '${createUserDto.user_email}' and is_active = 'Y'`,
            ),
        );
        if (exisingUser && exisingUser.length > 0) {
          await tx.commit();
          return {
            status: HttpStatus.CONFLICT,
            message: 'User already exists',
            data: exisingUser,
          };
        }
      }
      let user = await tx.run(
        INSERT.into('PCF_DB_LOGIN_USER').entries(createUserDto),
      );
      await tx.commit();
      return {
        status: HttpStatus.CREATED,
        message: 'User created successfully',
        data: createUserDto,
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

  async UpdateUser(
    currentUser: CurrentUserDto,
    updateLoginUser: UpdateLoginUserDto,
  ): Promise<ResponseDto> {
    let tx = cds.transaction();
    try {
      updateLoginUser.changed_on = new Date();
      updateLoginUser.changed_by = currentUser.user_id;

      let user = await tx.run(
        UPDATE('PCF_DB_LOGIN_USER')
          .set({
            user_name: updateLoginUser.user_name,
            user_email: updateLoginUser.user_email,
            password: updateLoginUser.password,
            user_emp_id: updateLoginUser.user_emp_id,
            changed_on: updateLoginUser.changed_on,
            changed_by: updateLoginUser.changed_by,
          })
          .where(
            `id = '${updateLoginUser.id}' 
            and customer_id_id='${updateLoginUser.customer_id_id}' 
            and is_active = 'Y'`,
          ),
      );

      await tx.commit();
      return {
        status: HttpStatus.OK,
        message: 'User updated successfully',
        data: updateLoginUser,
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

  async ReadLoginUser(
    currentUser: CurrentUserDto,
    id: string,
    customer_id: string,
  ): Promise<ResponseDto> {
    try {
      let user = await cds.run(
        SELECT.from('PCF_DB_LOGIN_USER')
          .columns(
            'id',
            'user_id',
            'user_name',
            'user_email',
            'is_active',
            'customer_id_id',
            'user_emp_id',
            'created_on',
            'created_by',
            'changed_on',
            'changed_by',
          )
          .where({
            customer_id_id: customer_id,
            id: id,
            is_active: 'Y',
          }),
      );

      return {
        status: HttpStatus.OK,
        message: 'User fetched successfully',
        data: user,
      };
    } catch (error) {
      return {
        status: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async DeleteLoginUser(
    currentUser: CurrentUserDto,
    deleteLoginUser: DeleteLoginUserDto,
  ) {
    let tx = cds.transaction();
    try {
      let user = await tx.run(
        UPDATE('PCF_DB_LOGIN_USER')
          .set({
            is_active: 'N',
            changed_on: new Date(),
            changed_by: currentUser.user_id,
          })
          .where(
            `id='${deleteLoginUser.id}' and customer_id_id='${deleteLoginUser.customer_id}' and is_active = 'Y'`,
          ),
      );

      await tx.commit();
      return {
        status: HttpStatus.OK,
        message: 'User deleted successfully',
        data: user,
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
