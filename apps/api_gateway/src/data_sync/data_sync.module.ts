import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/src';
import { DatabaseModule } from '@app/share_lib/database/database.module';
import { DatabaseService } from '@app/share_lib/database/database.service';
import { AppService } from '../app.service';
import { DataSyncService } from './data_sync.service';
import { DataSyncController } from './data_sync.controller';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [DataSyncService, DatabaseService, AppService],
  controllers: [DataSyncController],
})
export class DataSyncModule {}
