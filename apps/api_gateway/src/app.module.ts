import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LoginModule } from './login/login.module';
import { LocalStrategy } from '../../../libs/auth/strategies/local.strategy';
import { AuthModule } from '@app/auth';
import { JwtStrategy } from 'libs/auth/strategies/jwt.strategy';
import { ValidateUserMiddleware } from './middlewares/validateuser.middleware';
import { request } from 'http';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true }), LoginModule],
  controllers: [AppController],
  providers: [AppService, LocalStrategy, JwtStrategy],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ValidateUserMiddleware).forRoutes(
      {
        path: 'auth/accessendpoints',
        method: RequestMethod.ALL,
      },
      {
        path: '/',
        method: RequestMethod.ALL,
      },
    );
  }
}
