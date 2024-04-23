import { Module } from "@nestjs/common";
import { PrivilegeMasterService } from "./privilege_master.service";
import { PrivilegeMasterController } from "./privilege_master.controller";
import { AuthModule } from "../auth/src";
import { DatabaseModule } from "@app/share_lib/database/database.module";
import { DatabaseService } from "@app/share_lib/database/database.service";
import { AppService } from "../app.service";

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [PrivilegeMasterService, DatabaseService, AppService],
  controllers: [PrivilegeMasterController],
})
export class PrivilegeMasterModule {}
