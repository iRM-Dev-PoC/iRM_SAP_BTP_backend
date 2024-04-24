import { Module } from '@nestjs/common';
import { ReportMasterService } from './report_master.service';
import { ReportMasterController } from "./report_master.controller";
import { AuthModule } from '../auth/src';
import { DatabaseModule } from '@app/share_lib/database/database.module';
import { DatabaseService } from '@app/share_lib/database/database.service';
import { AppService } from '../app.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [ReportMasterService, DatabaseService, AppService],
  controllers: [ReportMasterController],
})
export class ReportMasterModule {}
