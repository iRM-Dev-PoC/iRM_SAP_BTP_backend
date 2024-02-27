import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LoginModule } from './login/login.module';
import { LocalStrategy } from '../../../libs/auth/strategies/local.strategy';
import { AuthModule } from '@app/auth';
import { JwtStrategy } from 'libs/auth/strategies/jwt.strategy';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true }), LoginModule],
  controllers: [AppController],
  providers: [AppService, LocalStrategy,JwtStrategy],
})
export class AppModule {}
