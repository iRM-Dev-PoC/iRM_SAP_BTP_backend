import { Module } from '@nestjs/common';
import { ControlMasterService } from "./control_master.service";
import { ControlMasterController } from "./control_master.controller";
import { AuthModule } from '../auth/src';
import { DatabaseModule } from '@app/share_lib/database/database.module';
import { DatabaseService } from '@app/share_lib/database/database.service';
import { AppService } from '../app.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [ControlMasterService, DatabaseService, AppService],
  controllers: [ControlMasterController],
})
export class ControlMasterModule {}
