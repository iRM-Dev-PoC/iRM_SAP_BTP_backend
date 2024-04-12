import { Module } from '@nestjs/common';
import { RoleMasterController } from './role_master.controller';
import { RoleMasterService } from './role_master.service';
import { AuthModule } from '../auth/src';
import { DatabaseModule } from '@app/share_lib/database/database.module';
import { DatabaseService } from '@app/share_lib/database/database.service';
import { AppService } from '../app.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [RoleMasterController],
  providers: [RoleMasterService, DatabaseService, AppService]
})
export class RoleMasterModule {}
