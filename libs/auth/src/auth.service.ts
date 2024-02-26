import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from 'libs/common-dto/src/auth/auth.dto';

@Injectable()
export class AuthService {
  constructor(private jwtservice: JwtService) {}

  async validateUser(AuthPayload: AuthDto) {

    
    return null;
  }
}
