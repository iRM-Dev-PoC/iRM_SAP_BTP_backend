import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "../auth/src";
import {
  CreateRoleMasterDto,
  DeleteRoleMasterDto,
  UpdateRoleMasterDto,
} from "./dto/roleMaster.dto";
import { RoleMasterService } from "./role_master.service";

@Controller("role-master")
// @UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe())
export class RoleMasterController {
  constructor(
    private roleService: RoleMasterService,
    private authService: AuthService,
  ) {}

  @Post("create-role")
  async CreateRole(
    @Req() req: Request,
    @Body() createRole: CreateRoleMasterDto,
  ) {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'ROLE_MASTER',
    //   'MANAGE_ROLE_MASTER',
    //   'write',
    // );
    return await this.roleService.CreateRoleMaster(
      // this.authService.GetUserFromRequest(req),
      createRole,
    );
  }

  @Get("get-role")
  async GetRole(@Body() { id, customer_id }) {
    console.log("id", id);
    console.log("customer_id", customer_id);
    return await this.roleService.GetRoleMaster(id, customer_id);
  }

  @Patch("update-role")
  async UpdateRole(
    @Req() req: Request,
    @Body() updateRole: UpdateRoleMasterDto,
  ) {
    return await this.roleService.UpdateRoleMaster(
      // this.authService.GetUserFromRequest(req),
      updateRole,
    );
  }

  @Patch("delete-role")
  async DeleteRole(
    @Req() req: Request,
    @Body() deleteRole: DeleteRoleMasterDto,
  ) {
    return await this.roleService.DeleteRoleMaster(
      // this.authService.GetUserFromRequest(req),
      deleteRole,
    );
  }

  @Get("get-all-Roles")
  async GetAllUsers() {
    return await this.roleService.GetAllRolesMaster();
  }
}
