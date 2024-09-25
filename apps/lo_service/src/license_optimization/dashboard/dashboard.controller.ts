import {
  Controller,
  ForbiddenException,
  Get,
  Req,
  Post,
  Body,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';

type getControlDetailsDTO = {
  id : number;
  hdrId : number;
}

type getExceptionDataDTO = {
  id : number;
  hdrId : number;
  flag : String;
}

type getUserStatusDto = {
  customer_id: number;
  hdrId: number;
};

// @UseGuards(JwtAuthGuard)
@Controller("lo/dashboard")
// Add metadata
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Post("users")
  async getUsersStatus(@Body() userStatus: getUserStatusDto) {
    return await this.dashboardService.getUsersStatus(userStatus);
  }

  @Post("get-control-data")
  async getControlData(@Body() controlDetails: getControlDetailsDTO) {
    return await this.dashboardService.getControlData(controlDetails);
  }

  /** Get Exception data against Control Checkpoint */
  @Post("get-exception-data")
  async getExceptionBaseData(@Body() controlDetails: getExceptionDataDTO) {
    return await this.dashboardService.getExceptionBaseData(controlDetails);
  }
}
