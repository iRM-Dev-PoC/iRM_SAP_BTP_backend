import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SubmoduleMasterService } from './submodule_master.service';
import { AuthService } from '../auth/src';
import {
  CreateSubModuleMasterDto,
  DeleteSubModuleMasterDto,
  UpdateSubModuleMasterDto,
} from './dto/submoduleMaster.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';

@Controller('submodule-master')

export class SubmoduleMasterController {
  constructor(
    private submoduleService: SubmoduleMasterService,
    private authService: AuthService,
  ) {}

  @Post('create-submodule')
  async CreateSubModule(
    @Req() req: Request,
    @Body() createSubModule: CreateSubModuleMasterDto,
  ) {
    this.authService.ValidatePrivileges(
      req,
      'SUBMODULE_MASTER',
      'MANAGE_SUBMODULE_MASTER',
      'write',
    );
    return await this.submoduleService.CreateSubModule(
      this.authService.GetUserFromRequest(req),
      createSubModule,
    );
  }

  @Post('get-submodule')
  async GetSubModule(@Req() req: Request, @Body() { id, customer_id }) {
    this.authService.ValidatePrivileges(
      req,
      'SUBMODULE_MASTER',
      'MANAGE_SUBMODULE_MASTER',
      'read',
    );
    return await this.submoduleService.GetSubModule(id, customer_id);
  }

  @Post('update-submodule')
  async UpdateSubModule(
    @Req() req: Request,
    @Body() updateSubModule: UpdateSubModuleMasterDto,
  ) {
    this.authService.ValidatePrivileges(
      req,
      'SUBMODULE_MASTER',
      'MANAGE_SUBMODULE_MASTER',
      'update',
    );

    return await this.submoduleService.UpdateSubModule(
      this.authService.GetUserFromRequest(req),
      updateSubModule,
    );
  }

  @Post('delete-submodule')
  async DeleteSubModule(
    @Req() req: Request,
    @Body() deleteSubModule: DeleteSubModuleMasterDto,
  ) {
    this.authService.ValidatePrivileges(
      req,
      'SUBMODULE_MASTER',
      'MANAGE_SUBMODULE_MASTER',
      'delete',
    );

    return await this.submoduleService.DeleteSubModule(
      this.authService.GetUserFromRequest(req),
      deleteSubModule,
    );
  }
}
