import { ShareLibModule } from "@app/share_lib";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import { AuthModule } from "../auth/src";
import { ConfigurationController } from "./configuration.controller";
import { DashboardModule } from "./dashboard/dashboard.module";
import { DataImportService } from "./data-import.service";
import { DataService } from "./data.service";
import { DataLoadController } from "./dataload.controller";
import { MasterController } from "./master.controller";

@Module({
  imports: [
    AuthModule,
    MulterModule.register({
      dest: process.env.UPLOAD_DEST,
    }),
    ShareLibModule,
    ConfigModule.forRoot(),
    DashboardModule,
  ],
  controllers: [DataLoadController, MasterController, ConfigurationController],
  providers: [DataImportService, DataService],
})
export class ProcesscontrolflowModule {}
