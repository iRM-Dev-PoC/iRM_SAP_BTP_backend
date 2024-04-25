import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/src';
import { DatabaseModule } from '@app/share_lib/database/database.module';
import { DatabaseService } from '@app/share_lib/database/database.service';
import { AppService } from '../app.service';
import { ReportCheckPointMappingService } from './report_check_point_mapping.service';
import { ReportCheckPointMappingController } from './report_check_point_mapping.controller';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [ReportCheckPointMappingService, DatabaseService, AppService],
  controllers: [ReportCheckPointMappingController],
})
export class ReportCheckPointMappingModule {}
