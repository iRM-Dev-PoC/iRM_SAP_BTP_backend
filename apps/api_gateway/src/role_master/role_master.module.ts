import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/src";
import { RoleMasterController } from "./role_master.controller";
import { RoleMasterService } from "./role_master.service";

@Module({
  imports: [AuthModule],
  controllers: [RoleMasterController],
  providers: [RoleMasterService],
})
export class RoleMasterModule {}
