import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import {
  CreateAssignRolePrivilegeDto,
  CreateAssignRoleToUserDto,
  DeleteRoleFromUserDto,
  GetRoleModuleSubmodulePrivilegeMappingDto,
  GetRoleOfUserDto,
  UpdateRoleModuleSubmodulePrivilegeMappingDto,
  UpdateRoleOfUserDto,
} from './dto/assign_role_privilege.dto';
import { AuthService } from '../auth/src';
import { AssignRolePrivilegeService } from './assign_role_privilege.service';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { create } from 'domain';
import { get } from 'http';

@Controller('assign-role-privilege')
// @UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe())
export class AssignRolePrivilegeController {
  constructor(
    private authService: AuthService,
    private assignRolePrivilege: AssignRolePrivilegeService,
  ) {}

  @Post('create-role-module-submodule-mapping')
  async CreateRolePrivilege(
    @Req() req: Request,
    @Body() createRoletoPrivilege: CreateAssignRolePrivilegeDto,
  ) {
    return await this.assignRolePrivilege.InsertRoleModuleSubmodulePrivilegeMapping(
      // this.authService.GetUserFromRequest(req),
      createRoletoPrivilege,
    );
  }

  @Post('get-role-module-submodule-mapping')
  async GetRoleModuleSubmodulePrivilegeMapping(
    @Req() req: Request,
    @Body()
    getRoleModuleSubmodulePrivilegeMappingDto: GetRoleModuleSubmodulePrivilegeMappingDto,
  ) {
    return await this.assignRolePrivilege.GetRoleModuleSubmodulePrivilegeMapping(
      // this.authService.GetUserFromRequest(req),
      getRoleModuleSubmodulePrivilegeMappingDto,
    );
  }

  @Post('update-role-module-submodule-mapping')
  async UpdateRoleModuleSubmodulePrivilegeMapping(
    @Req() req: Request,
    @Body()
    updateRoleModuleSubmodulePrivilegeMappingDto: UpdateRoleModuleSubmodulePrivilegeMappingDto,
  ) {
    return await this.assignRolePrivilege.UpdateRoleModuleSubmodulePrivilegeMapping(
      // this.authService.GetUserFromRequest(req),
      updateRoleModuleSubmodulePrivilegeMappingDto,
    );
  }

  @Post('delete-role-module-submodule-mapping')
  async DeleteRoleModuleSubmodulePrivilegeMapping(
    @Req() req: Request,
    @Body()
    { id, customer_id },
  ) {
    return await this.assignRolePrivilege.DeleteRoleModuleSubmodulePrivilegeMapping(
      // this.authService.GetUserFromRequest(req),
      id,
      customer_id
    );
  }

  @Post('invoke-role-to-user')
  async InvokeRoleToUser(
    @Req() req: Request,
    @Body()
    createAssignRoleToUserDto: CreateAssignRoleToUserDto,
  ) {
    return await this.assignRolePrivilege.AssignRoleToUser(
      // this.authService.GetUserFromRequest(req),
      createAssignRoleToUserDto,
    );
  }

  @Post('get-role-of-user')
  async GetRoleOfUser(
    @Req() req: Request,
    @Body()
    getRoleOfUserDto: GetRoleOfUserDto,
  ) {
    return await this.assignRolePrivilege.GetRoleOfUser(
      // this.authService.GetUserFromRequest(req),
      getRoleOfUserDto,
    );
  }

  @Post('update-role-of-user')
  async UpdateRoleOfUser(
    @Req() req: Request,
    @Body()
    updateRoleOfUserDto: UpdateRoleOfUserDto,
  ) {
    return await this.assignRolePrivilege.UpdateRoleOfUser(
      // this.authService.GetUserFromRequest(req),
      updateRoleOfUserDto,
    );
  }

  @Post('delete-role-from-user')
  async DeleteRoleFromUser(
    @Req() req: Request,
    @Body()
    deleteRoleFromUserDto: DeleteRoleFromUserDto,
  ) {
    return await this.assignRolePrivilege.RemoveRoleFromUser(
      this.authService.GetUserFromRequest(req),
      deleteRoleFromUserDto,
    );
  }
}
