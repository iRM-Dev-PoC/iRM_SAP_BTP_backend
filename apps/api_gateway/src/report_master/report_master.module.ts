import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/src";
import { ReportMasterController } from "./report_master.controller";
import { ReportMasterService } from "./report_master.service";

@Module({
  imports: [AuthModule],
  providers: [ReportMasterService],
  controllers: [ReportMasterController],
})
export class ReportMasterModule {}
