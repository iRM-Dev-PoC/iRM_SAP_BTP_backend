import { Body, Controller, Post } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

type getActiveUsersRolesDTO = {
  customer_id: number;
  hdrId: number;
};

type getUserStatusDto = {
  customer_id: number;
  hdrId: number;
};

@Controller("lo/dashboard")
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Post("users")
  async getUsersStatus(@Body() userStatus: getUserStatusDto) {
    return await this.dashboardService.getUsersStatus(userStatus);
  }

  @Post("get-active-users-roles")
  async getActiveUsersRolesData(
    @Body() getActiveUsersRolesDto: getActiveUsersRolesDTO,
  ) {
    return await this.dashboardService.getActiveUsersRolesData(
      getActiveUsersRolesDto,
    );
  }
}
