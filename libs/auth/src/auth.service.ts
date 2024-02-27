import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import cds from '@sap/cds';
import { AuthDto, LoginDto } from 'libs/auth/dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private jwtservice: JwtService) {}

  async validateUser(AuthPayload: LoginDto) {
    const user = await cds.run(
      SELECT.from('PCF_DB_LOGIN_USER')
        .columns('user_email', 'id', 'password')
        .where({
          user_email: AuthPayload.username,
          is_active:'Y'
        }),
    );
    if (!user || user.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    } else {
      if (user[0].password === AuthPayload.password) {
        let userid: string = user[0].id.toString();
        let userprivileges = await cds.run(
          `SELECT ROLE_NAME,MODULE_NAME,SUBMODULE_NAME,PRIVILEGE from GET_ALL_PRIVILEGES_BY_USER_ID('${userid}')`,
        );
        // console.log(userprivileges);
        let payload: AuthDto = {
          username: user[0].user_email,
          id: user[0].id,
          privileges: userprivileges,
        };
        return {
          access_token: this.jwtservice.sign(payload),
          //data: payload,
        };
      } else {
        throw new UnauthorizedException('Invalid credentials');
      }
    }
  }
}
