import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/src";
import { ControlMasterController } from "./control_master.controller";
import { ControlMasterService } from "./control_master.service";

@Module({
  imports: [AuthModule],
  providers: [ControlMasterService],
  controllers: [ControlMasterController],
})
export class ControlMasterModule {}
