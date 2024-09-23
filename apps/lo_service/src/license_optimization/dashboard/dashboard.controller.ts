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

type getInactiveUsersDto = {
  customer_id: number;
  hdrId: number;
};

// @UseGuards(JwtAuthGuard)
@Controller("lo/dashboard")
// Add metadata
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Post("inactive-users")
  async getInactiveUsers(
    @Body() inactiveUsers: getInactiveUsersDto,
  ) {
    return await this.dashboardService.getInactiveUsers(inactiveUsers);
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
