import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/src';
import { DashboardController } from './dashboard.controller';
import { DataLoadController } from './dataload.controller';
import { MasterController } from './master.controller';
import { ConfigurationController } from './configuration.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    AuthModule,
    MulterModule.register({
      dest: process.env.UPLOAD_DEST,
    }),
  ],
  controllers: [
    DashboardController,
    DataLoadController,
    MasterController,
    ConfigurationController,
  ],
  providers: [],
  exports: [],
})
export class ProcesscontrolflowModule {}
