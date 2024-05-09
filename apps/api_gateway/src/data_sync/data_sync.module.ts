import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/src";
import { DataSyncController } from "./data_sync.controller";
import { DataSyncService } from "./data_sync.service";

@Module({
  imports: [AuthModule],
  providers: [DataSyncService],
  controllers: [DataSyncController],
})
export class DataSyncModule {}
