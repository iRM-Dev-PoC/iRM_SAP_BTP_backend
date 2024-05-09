import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/src";
import { JwtStrategy } from "./auth/strategies/jwt.strategy";
import { LocalStrategy } from "./auth/strategies/local.strategy";
import { LoginModule } from "./login/login.module";
import { ValidateUserMiddleware } from "./middlewares/validateuser.middleware";
import { ModuleMasterModule } from "./module_master/module_master.module";
import { ProcesscontrolflowModule } from "./processcontrolflow/processcontrolflow.module";
import { RoleMasterModule } from "./role_master/role_master.module";
import { SubmoduleMasterModule } from "./submodule_master/submodule_master.module";
import { SyncServiceModule } from "./sync_service/sync_service.module";

import { ShareLibModule } from "@app/share_lib";
import { AssignRolePrivilegeModule } from "./assign_role_privilege/assign_role_privilege.module";
import { CheckPointMasterModule } from "./check_point_master/check_point_master.module";
import { ControlFamilyMasterModule } from "./control_family_master/control_family_master.module";
import { ControlMasterModule } from "./control_master/control_master.module";
import { DataSyncModule } from "./data_sync/data_sync.module";
import { PrivilegeMasterModule } from "./privilege_master/privilege_master.module";
import { ReportCheckPointMappingModule } from "./report_check_point_mapping/report_check_point_mapping.module";
import { ReportMasterModule } from "./report_master/report_master.module";

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
    PrivilegeMasterModule,
    ReportMasterModule,
    ControlMasterModule,
    CheckPointMasterModule,
    ReportCheckPointMappingModule,
    DataSyncModule,
    ControlFamilyMasterModule,
  ],
  controllers: [AppController],
  providers: [AppService, LocalStrategy, JwtStrategy],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ValidateUserMiddleware)
      .exclude({ path: "auth/login", method: RequestMethod.POST })
      .forRoutes("*");
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
