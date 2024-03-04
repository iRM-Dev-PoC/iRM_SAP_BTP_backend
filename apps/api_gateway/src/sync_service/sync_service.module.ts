import { Module } from '@nestjs/common';
import { SyncServiceController } from './sync_service.controller';

@Module({
  controllers: [SyncServiceController]
})
export class SyncServiceModule {}
