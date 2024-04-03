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
import { ValidateUserMiddleware } from './middlewares/validateuser.middleware';
import { AuthModule } from './auth/src';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { ProcesscontrolflowModule } from './processcontrolflow/processcontrolflow.module';
import { ModuleMasterModule } from './module_master/module_master.module';
import { SyncServiceModule } from './sync_service/sync_service.module';
import { SubmoduleMasterModule } from './submodule_master/submodule_master.module';
import { RoleMasterModule } from './role_master/role_master.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'ormconfig';
import { PrismaService } from '@app/share_lib/prisma.service';
import { share } from 'rxjs';
import { ShareLibModule } from '@app/share_lib';
import { AssignRolePrivilegeModule } from './assign_role_privilege/assign_role_privilege.module';
import { DatabaseModule } from '@app/share_lib/database/database.module';
import { DatabaseService } from '@app/share_lib/database/database.service';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    LoginModule,
    ProcesscontrolflowModule,
    ModuleMasterModule,
    SyncServiceModule,
    SubmoduleMasterModule,
    RoleMasterModule,
    //  TypeOrmModule.forRoot(typeOrmConfig)
    ShareLibModule,
    AssignRolePrivilegeModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService, LocalStrategy, JwtStrategy, DatabaseService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ValidateUserMiddleware)
      .exclude({ path: 'auth/login', method: RequestMethod.POST })
      .forRoutes('*');
    // .forRoutes(
    //   {
    //     path: 'auth/accessendpoints',
    //     method: RequestMethod.ALL,
    //   },
    //   {
    //     path: '/',
    //     method: RequestMethod.ALL,
    //   },
    // );
  }
}
