import { Module } from '@nestjs/common';
import { SyncServiceController } from './sync_service.controller';
import { SyncServiceService } from './sync_service.service';
import * as dotenv from 'dotenv';
import { ConfigModule } from '@nestjs/config';
dotenv.config({ path: '.env' });

@Module({
  imports: [
    ConfigModule.forRoot({
      // Optional configuration for other sources if needed
    }),
  ],
  controllers: [SyncServiceController],
  providers: [SyncServiceService],
  exports: [],
})
export class SyncServiceModule {}
