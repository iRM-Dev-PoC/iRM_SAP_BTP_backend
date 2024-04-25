import { Module } from '@nestjs/common';
import { CheckPointMasterService } from "./check_point_master.service";
import { CheckPointMasterController } from "./check_point_master.controller";
import { AuthModule } from '../auth/src';
import { DatabaseModule } from '@app/share_lib/database/database.module';
import { DatabaseService } from '@app/share_lib/database/database.service';
import { AppService } from '../app.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [CheckPointMasterService, DatabaseService, AppService],
  controllers: [CheckPointMasterController],
})
export class CheckPointMasterModule {}
