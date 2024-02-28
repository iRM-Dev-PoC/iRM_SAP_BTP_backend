import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/src';
import { DashboardController } from './dashboard.controller';
import { DataLoadController } from './dataload.controller';
import { MasterController } from './master.controller';
import { ConfigurationController } from './configuration.controller';

@Module({
    imports: [AuthModule],
    controllers: [DashboardController,DataLoadController,MasterController,ConfigurationController],
    providers: [],
    exports: [],
})
export class ProcesscontrolflowModule {}
