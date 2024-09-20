import { ShareLibModule } from "@app/share_lib";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import { DashboardModule } from "./dashboard/dashboard.module";
import { DataImportService } from "./data-import.service";
import { DataService } from "./data.service";
import { DataLoadController } from "./dataload.controller";


@Module({
  imports: [
    MulterModule.register({
      dest: process.env.UPLOAD_DEST,
    }),
    ShareLibModule,
    ConfigModule.forRoot(),
    DashboardModule,
  ],
  controllers: [DataLoadController],
  providers: [DataImportService, DataService],
})
export class licenseOptimizationModule {}
