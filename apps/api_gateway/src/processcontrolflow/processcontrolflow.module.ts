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
import { ConfigModule, ConfigService } from '@nestjs/config';

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
      useFactory: (configService: ConfigService) => {
        const postgresUser = configService. get<string>('POSTGRES_USER');
        const postgresPassword = configService.get<string>('POSTGRES_PASSWORD');
        const postgresHost = configService.get<string>('POSTGRES_HOST');
        const postgresDatabase = configService.get<string>('POSTGRES_DB');
        const postgresPort = configService.get<number>('POSTGRES_PORT');

        // Validate the password
        if (!postgresPassword || typeof postgresPassword !== 'string') {
          throw new Error(
            'POSTGRES_PASSWORD environment variable must be a non-empty string',
          );
        }

        return new Pool({
          user: postgresUser,
          password: postgresPassword,
          host: postgresHost,
          database: postgresDatabase,
          port: postgresPort,
        });
      },
      inject: [ConfigService],
    },
    DataService,
  ],
})
export class ProcesscontrolflowModule {}
