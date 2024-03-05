import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { use } from 'passport';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { RoleMasterService } from './role_master.service';
import { AuthService } from '../auth/src';
import {
  CreateRoleMasterDto,
  DeleteRoleMasterDto,
  UpdateRoleMasterDto,
} from './dto/roleMaster.dto';
import { Console } from 'console';

@Controller('role-master')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe())
export class RoleMasterController {
  constructor(
    private roleService: RoleMasterService,
    private authService: AuthService,
  ) {}

  @Post('create-role')
  async CreateRole(
    @Req() req: Request,
    @Body() createRole: CreateRoleMasterDto,
  ) {
    return await this.roleService.CreateRoleMaster(
      this.authService.GetUserFromRequest(req),
      createRole,
    );
  }

  @Post('get-role')
  async GetRole(@Body() { id, customer_id }) {
    console.log('id', id);
    console.log('customer_id', customer_id);
    return await this.roleService.GetRoleMaster(id, customer_id);
  }

  @Post('update-role')
  async UpdateRole(
    @Req() req: Request,
    @Body() updateRole: UpdateRoleMasterDto,
  ) {
    return await this.roleService.UpdateRoleMaster(
      this.authService.GetUserFromRequest(req),
      updateRole,
    );
  }

  @Post('delete-role')
  async DeleteRole(
    @Req() req: Request,
    @Body() deleteRole: DeleteRoleMasterDto,
  ) {
    return await this.roleService.DeleteRoleMaster(
      this.authService.GetUserFromRequest(req),
      deleteRole,
    );
  }
}
