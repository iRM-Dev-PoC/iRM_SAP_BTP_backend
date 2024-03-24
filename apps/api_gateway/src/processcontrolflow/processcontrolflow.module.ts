import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/src';
import { DashboardController } from './dashboard.controller';
import { DataLoadController } from './dataload.controller';
import { MasterController } from './master.controller';
import { ConfigurationController } from './configuration.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ShareLibModule } from '@app/share_lib';
import { DataImportService } from './data-import.service';
import { Pool } from 'pg';
import { DataService } from './data.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    MulterModule.register({
      dest: process.env.UPLOAD_DEST,
    }),
    ShareLibModule,
    ConfigModule.forRoot(),
  ],
  controllers: [
    DashboardController,
    DataLoadController,
    MasterController,
    ConfigurationController,
  ],
  providers: [
    DataImportService,
    {
      provide: Pool,
      useValue: new Pool({
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        port: parseInt(process.env.POSTGRES_PORT),
      }),
    },
    DataService,
  ],
})
export class ProcesscontrolflowModule {}
