import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DataSyncService } from './data_sync.service';

type syncDtlsDTO = {
  id: number;
}

@Controller("data-sync")
@UsePipes(new ValidationPipe())
export class DataSyncController {
  constructor(private controlMasterService: DataSyncService) {}

  @Get("get-all-headers")
  async GetAllUsers() {
    return await this.controlMasterService.GetAllHeader();
  }

  @Post("get-all-details")
  async GetAllSyncDtls(@Body() syncDtlsDto: syncDtlsDTO) {
    return await this.controlMasterService.GetAllSyncDtls(syncDtlsDto);
  }
}
