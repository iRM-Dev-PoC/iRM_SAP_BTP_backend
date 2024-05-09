import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/src";
import { ReportCheckPointMappingController } from "./report_check_point_mapping.controller";
import { ReportCheckPointMappingService } from "./report_check_point_mapping.service";

@Module({
  imports: [AuthModule],
  providers: [ReportCheckPointMappingService],
  controllers: [ReportCheckPointMappingController],
})
export class ReportCheckPointMappingModule {}
