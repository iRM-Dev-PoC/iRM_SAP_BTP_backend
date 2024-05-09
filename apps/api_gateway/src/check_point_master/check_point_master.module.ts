import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/src";
import { CheckPointMasterController } from "./check_point_master.controller";
import { CheckPointMasterService } from "./check_point_master.service";

@Module({
  imports: [AuthModule],
  providers: [CheckPointMasterService],
  controllers: [CheckPointMasterController],
})
export class CheckPointMasterModule {}
