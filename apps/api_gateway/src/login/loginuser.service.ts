import { HttpStatus, Injectable } from '@nestjs/common';
import cds from '@sap/cds';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateLoginUserDto,
  DeleteLoginUserDto,
  UpdateLoginUserDto,
} from './dto/loginuser.dto';
import { DatabaseService } from '@app/share_lib/database/database.service';
import { CurrentUserDto, ResponseDto } from '@app/share_lib/common.dto';

@Injectable()
export class LoginUserService {
  constructor(
    private databaseService: DatabaseService,
    // private jwtservice: JwtService,
  ) {}

  async CreateUser(
    //currentUser: CurrentUserDto,
    createUserDto: CreateLoginUserDto,
  ): Promise<ResponseDto> {
    //let tx = cds.transaction();
    const hanaOptions = this.databaseService.getHanaOptions();
    try {
      createUserDto.user_id = uuidv4();
      createUserDto.created_on = new Date();
      //console.log(currentUser.user_id);
      // createUserDto.created_by = currentUser.user_id ? currentUser.user_id : "4"; //
      createUserDto.created_by = '4';
      if (createUserDto.user_name || createUserDto.user_email) {
        // let exisingUser = await tx.run(

        //   SELECT.from('PCF_DB_LOGIN_USER')
        //     .columns('user_name', 'user_email', 'is_active')
        //     .where(
        //       `user_name = '${createUserDto.user_name}' OR user_email = '${createUserDto.user_email}' and is_active = 'Y'`,
        //     ),
        // );

        let exisingUser = await this.databaseService.executeQuery(
          `SELECT user_name, user_email, is_active FROM ${hanaOptions.schema}.PCF_DB_LOGIN_USER WHERE user_name = '${createUserDto.user_name}' OR user_email = '${createUserDto.user_email}' and is_active = 'Y'`,
          hanaOptions,
        );
        if (exisingUser && exisingUser.length > 0) {
          // await tx.commit();
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'User already exists',
            data: exisingUser,
          };
        }
      }
      // let user = await tx.run(
      //   INSERT.into('PCF_DB_LOGIN_USER').entries(createUserDto),
      // );

      let query = `INSERT INTO ${hanaOptions.schema}.PCF_DB_LOGIN_USER (ID, user_name, user_email) VALUES (1, '${createUserDto.user_name}', '${createUserDto.user_email}')`;
      console.log(query);

      let user = await this.databaseService.executeQuery(query, hanaOptions);
      // await tx.commit();
      return {
        statuscode: HttpStatus.CREATED,
        message: 'User created successfully',
        data: createUserDto,
      };
    } catch (error) {
      //await tx.rollback();
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async UpdateUser(
    // currentUser: CurrentUserDto,
    updateLoginUser: UpdateLoginUserDto,
  ): Promise<ResponseDto> {
    const hanaOptions = this.databaseService.getHanaOptions();
    // let tx = cds.transaction();
    try {
      updateLoginUser.changed_on = new Date();
      updateLoginUser.changed_by = '4';

      const changedOnIsoString = updateLoginUser.changed_on.toISOString();

      if (updateLoginUser.user_name || updateLoginUser.user_email) {
        // let exisingUser = await tx.run(
        //   SELECT.from('PCF_DB_LOGIN_USER')
        //     .columns('user_name', 'user_email', 'is_active')
        //     .where(
        //       `id != '${updateLoginUser.id}' AND (user_name = '${updateLoginUser.user_name}' OR user_email = '${updateLoginUser.user_email}') and is_active = 'Y'`,
        //     ),
        // );
        let existingUser = await this.databaseService.executeQuery(
          `SELECT user_name, user_email, is_active FROM ${hanaOptions.schema}.PCF_DB_LOGIN_USER WHERE id != '${updateLoginUser.id}' AND (user_name = '${updateLoginUser.user_name}' OR user_email = '${updateLoginUser.user_email}') AND is_active = 'Y'`,
          hanaOptions,
        );
        // console.log('exisingUser', exisingUser);
        if (existingUser && existingUser.length > 0) {
          // await tx.commit();
          return {
            statuscode: HttpStatus.CONFLICT,
            message: 'User already exists',
            data: existingUser,
          };
        }
      }

      // let user = await tx.run(
      //   UPDATE('PCF_DB_LOGIN_USER')
      //     .set({
      //       user_name: updateLoginUser.user_name,
      //       user_email: updateLoginUser.user_email,
      //       password: updateLoginUser.password,
      //       user_emp_id: updateLoginUser.user_emp_id,
      //       changed_on: updateLoginUser.changed_on,
      //       changed_by: updateLoginUser.changed_by,
      //     })
      //     .where(
      //       `id = '${updateLoginUser.id}'
      //       and customer_id_id='${updateLoginUser.customer_id_id}'
      //       and is_active = 'Y'`,
      //     ),
      // );

      let query = `UPDATE ${hanaOptions.schema}.PCF_DB_LOGIN_USER SET user_name = '${updateLoginUser.user_name}', user_email = '${updateLoginUser.user_email}', password = '${updateLoginUser.password}', user_emp_id = '${updateLoginUser.user_emp_id}', changed_on = '${changedOnIsoString}', changed_by = '${updateLoginUser.changed_by}' WHERE id = '${updateLoginUser.id}' AND customer_id_id='${updateLoginUser.customer_id_id}' AND is_active = 'Y'`;

      console.log(query);

      // await tx.commit();
      await this.databaseService.executeQuery(query, hanaOptions);
      return {
        statuscode: HttpStatus.OK,
        message: 'User updated successfully',
        data: updateLoginUser,
      };
    } catch (error) {
      // await tx.rollback();
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async ReadLoginUser(
    // currentUser: CurrentUserDto,
    id: string,
    customer_id: string,
  ): Promise<ResponseDto> {
    const hanaOptions = this.databaseService.getHanaOptions();
    try {
      // let user = await cds.run(
      //   SELECT.from('PCF_DB_LOGIN_USER')
      //     .columns(
      //       'id',
      //       'user_id',
      //       'user_name',
      //       'user_email',
      //       'is_active',
      //       'customer_id_id',
      //       'user_emp_id',
      //       'created_on',
      //       'created_by',
      //       'changed_on',
      //       'changed_by',
      //     )
      //     .where({
      //       customer_id_id: customer_id,
      //       id: id,
      //       is_active: 'Y',
      //     }),
      // );

      let query = `SELECT id, user_id, user_name, user_email, is_active, customer_id_id, user_emp_id, created_on, created_by, changed_on, changed_by FROM ${hanaOptions.schema}.PCF_DB_LOGIN_USER WHERE customer_id_id = '${customer_id}' AND id = '${id}' AND is_active = 'Y'`;

      let user = await this.databaseService.executeQuery(query, hanaOptions);

      if (!user || user.length == 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'User not found',
          data: user,
        };
      }
      return {
        statuscode: HttpStatus.OK,
        message: 'User fetched successfully',
        data: user,
      };
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async DeleteLoginUser(
    // currentUser: CurrentUserDto,
    deleteLoginUser: DeleteLoginUserDto,
  ) {
    const hanaOptions = this.databaseService.getHanaOptions();
    // let tx = cds.transaction();
    try {
      // let user = await tx.run(
      //   UPDATE('PCF_DB_LOGIN_USER')
      //     .set({
      //       is_active: 'N',
      //       changed_on: new Date(),
      //       changed_by: currentUser.user_id,
      //     })
      //     .where(
      //       `id='${deleteLoginUser.id}' and customer_id_id='${deleteLoginUser.customer_id}' and is_active = 'Y'`,
      //     ),
      // );

      const changedOnIsoString = new Date().toISOString();

      let query = `UPDATE ${hanaOptions.schema}.PCF_DB_LOGIN_USER SET is_active = 'N', changed_on = '${changedOnIsoString}', changed_by = '4' WHERE id = '${deleteLoginUser.id}' AND customer_id_id = '${deleteLoginUser.customer_id}' AND is_active = 'Y'`;

      let user = await this.databaseService.executeQuery(query, hanaOptions);



      // await tx.commit();
      if (user == 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'User not found for deletion',
          data: user,
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'User deleted successfully',
        data: user,
      };
    } catch (error) {
      // await tx.rollback();
      return {
        status: error.status,
        message: error.message,
        data: null,
      };
    }
  }
}
