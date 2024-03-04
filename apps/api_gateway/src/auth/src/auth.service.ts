import { Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import cds from '@sap/cds';
import { AuthDto, LoginDto } from '../dto/auth.dto';
import { Request } from 'express';
import { CurrentUserDto } from '@app/share_lib/common.dto';

@Injectable()
export class AuthService {
  constructor(private jwtservice: JwtService) {}

  async ValidateUser(AuthPayload: LoginDto) {
    try {
      const user = await cds.run(
        SELECT.from('PCF_DB_LOGIN_USER')
          .columns('user_email', 'id', 'password')
          .where({
            user_email: AuthPayload.username,
            is_active: 'Y',
          }),
      );
      if (!user || user.length === 0) {
        throw new UnauthorizedException('Invalid credentials');
      } else {
        if (user[0].password === AuthPayload.password) {
          let userid: string = user[0].id.toString();

          let userprivileges = await cds.run(
            `SELECT ROLE_ID,ROLE_NAME,MODULE_NAME,SUBMODULE_NAME,DISPLAY_MODULE_NAME,DISPLAY_SUBMODULE_NAME,PRIVILEGE,CUSTOMER_ID from GET_ALL_PRIVILEGES_BY_USER_ID('${userid}')`,
          );
          // console.log(userprivileges);
          let payload: AuthDto = {
            username: user[0].user_email,
            user_id: user[0].id,
            customer_id: userprivileges[0].customer_id,
            privileges: userprivileges,
          };

          return {
            // payload: payload,
            access_token: this.jwtservice.sign(payload),
          };
        } else {
          throw new UnauthorizedException('Invalid credentials');
        }
      }
    } catch (error) {
      return {
        status: error.status,
        message: error.message,
      };
    }
  }

  GetPayloadFromToken(token: string) {
    try {
      // console.log(this.jwtservice.verify(token));
      return this.jwtservice.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  ValidatePrivileges(
    req: Request,
    module: string,
    submodule: string,
    operation: string,
  ): boolean {
    if (!req.headers.authorization) {
      throw new UnauthorizedException('authorization header not found ');
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException();
    }
    const CurrentUser = this.GetPayloadFromToken(token);
    if (!CurrentUser) {
      throw new UnauthorizedException();
    }
    let privileges = CurrentUser.privileges;
    if (!privileges) {
      throw new UnauthorizedException('No privileges given to the user');
    }
    let IsAllowed = false;

    if (module && submodule && operation) {
      IsAllowed = privileges.some((privilege) => {
        // console.log('privilege', privilege);

        return (
          privilege.module_name.toLowerCase() === module.toLowerCase() &&
          (privilege.submodule_name == null
            ? ''
            : privilege.submodule_name.toLowerCase()) ===
            submodule.toLowerCase() &&
          privilege.privilege.toLowerCase() === operation.toLowerCase()
        );
      });
    }

    return IsAllowed;
  }

  GetUserFromRequest(req): CurrentUserDto {
    if (!req.headers.authorization) {
      throw new UnauthorizedException('authorization header not found ');
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException();
    }
    const { privileges, ...CurrentUser }: any = this.GetPayloadFromToken(token);
    if (!CurrentUser) {
      throw new UnauthorizedException();
    }
    return CurrentUser;
  }
}
