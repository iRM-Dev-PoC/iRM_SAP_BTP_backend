import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/src";
import { ControlFamilyMasterController } from "./control_family_master.controller";
import { ControlFamilyMasterService } from "./control_family_master.service";

@Module({
  imports: [AuthModule],
  providers: [ControlFamilyMasterService],
  controllers: [ControlFamilyMasterController],
})
export class ControlFamilyMasterModule {}
