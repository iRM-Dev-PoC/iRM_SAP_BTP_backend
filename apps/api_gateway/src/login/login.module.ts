import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { AuthModule } from '../auth/src';
import { LoginUserController } from './loginuser.controller';
import { LoginUserService } from './loginuser.service';
import { DatabaseService } from '@app/share_lib/database/database.service';
import { DatabaseModule } from '@app/share_lib/database/database.module';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [LoginController, LoginUserController],
  providers: [LoginUserService, DatabaseService],
})
export class LoginModule {}
