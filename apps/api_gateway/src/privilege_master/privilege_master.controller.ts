import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwtAuth.guard";
import { PrivilegeMasterService } from "./privilege_master.service";
import {
  CreatePrivilegeMasterDto,
  DeletePrivilegeMasterDto,
  UpdatePrivilegeMasterDto,
} from "./dto/privilegeMaster.dto";
import { ResponseDto } from "@app/share_lib/common.dto";
import { AuthService } from "../auth/src";
import { Request } from "express";

@Controller("privilege-master")
// @UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe())
export class PrivilegeMasterController {
  constructor(
    private privilegeMasterService: PrivilegeMasterService,
    private authService: AuthService,
  ) {}

  @Post("create-privilege")
  async CreatePrivilege(
    @Req() req: Request,
    @Body() createprivilegeDto: CreatePrivilegeMasterDto,
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'privilege_MASTER',
    //   'MANAGE_privilege_MASTER',
    //   'write',
    // );

    return await this.privilegeMasterService.CreatePrivilege(
      // this.authService.GetUserFromRequest(req),
      createprivilegeDto,
    );
  }

  @Patch("update-privilege")
  async UpdatePrivilege(
    @Req() req: Request,
    @Body() updateprivilegeDto: UpdatePrivilegeMasterDto,
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'privilege_MASTER',
    //   'MANAGE_privilege_MASTER',
    //   'update',
    // );
    return await this.privilegeMasterService.UpdatePrivilege(
      // this.authService.GetUserFromRequest(req),
      updateprivilegeDto,
    );
  }

  @Get("get-privilege")
  async GetPrivilege(
    @Req() req: Request,
    @Body() { id, customer_id },
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'privilege_MASTER',
    //   'MANAGE_privilege_MASTER',
    //   'read',
    // );
    return await this.privilegeMasterService.GetPrivilege(
      // this.authService.GetUserFromRequest(req),
      id,
      customer_id,
    );
  }

  @Patch("delete-privilege")
  async DeletePrivilege(
    @Req() req: Request,
    @Body() deleteprivilegeDto: DeletePrivilegeMasterDto,
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'privilege_MASTER',
    //   'MANAGE_privilege_MASTER',
    //   'delete',
    // );
    return await this.privilegeMasterService.DeletePrivilege(
      // this.authService.GetUserFromRequest(req),
      deleteprivilegeDto,
    );
  }

  @Get("get-all-privileges")
  async GetAllPrivileges() {
    return await this.privilegeMasterService.GetAllPrivileges();
  }
}
