import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { AuthModule } from '@app/auth';

@Module({
  imports: [AuthModule],
  controllers: [LoginController],
})
export class LoginModule {}
