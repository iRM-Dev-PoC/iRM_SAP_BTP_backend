import { Module } from '@nestjs/common';
import { ModuleMasterService } from './module_master.service';
import { ModuleMasterController } from './module_master.controller';
import { AuthModule } from '../auth/src';
import { DatabaseModule } from '@app/share_lib/database/database.module';
import { DatabaseService } from '@app/share_lib/database/database.service';
import { AppService } from '../app.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [ModuleMasterService, DatabaseService, AppService],
  controllers: [ModuleMasterController],
})
export class ModuleMasterModule {}
