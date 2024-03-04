import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { AuthModule } from '../auth/src';
import { LoginUserController } from './loginuser.controller';
import { LoginUserService } from './loginuser.service';

@Module({
  imports: [AuthModule],
  controllers: [LoginController, LoginUserController],
  providers: [LoginUserService],
})
export class LoginModule {}
