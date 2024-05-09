import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/src";
import { PrivilegeMasterController } from "./privilege_master.controller";
import { PrivilegeMasterService } from "./privilege_master.service";

@Module({
  imports: [AuthModule],
  providers: [PrivilegeMasterService],
  controllers: [PrivilegeMasterController],
})
export class PrivilegeMasterModule {}
