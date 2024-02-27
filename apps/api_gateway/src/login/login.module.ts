import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { AuthModule } from '@app/auth';
import { LocalStrategy } from 'libs/auth/strategies/local.strategy';

@Module({
  imports: [AuthModule],
  controllers: [LoginController],
})
export class LoginModule {}
