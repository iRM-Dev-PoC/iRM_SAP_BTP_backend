import { Module } from '@nestjs/common';
import { ControlFamilyMasterService } from "./control_family_master.service";
import { ControlFamilyMasterController } from "./control_family_master.controller";
import { AuthModule } from '../auth/src';
import { DatabaseModule } from '@app/share_lib/database/database.module';
import { DatabaseService } from '@app/share_lib/database/database.service';
import { AppService } from '../app.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [ControlFamilyMasterService, DatabaseService, AppService],
  controllers: [ControlFamilyMasterController],
})
export class ControlFamilyMasterModule {}
