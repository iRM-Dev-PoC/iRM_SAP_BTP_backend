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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { ModuleMasterService } from './module_master.service';
import {
  CreateModuleMasterDto,
  DeleteModuleMasterDto,
  UpdateModuleMasterDto,
} from './dto/moduleMaster.dto';
import { ResponseDto } from '@app/share_lib/common.dto';
import { AuthService } from '../auth/src';
import { Request } from 'express';

@Controller('module-master')
// @UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe())
export class ModuleMasterController {
  constructor(
    private moduleMasterService: ModuleMasterService,
    private authService: AuthService,
  ) {}

  @Post('create-module')
  async CreateModule(
    @Req() req: Request,
    @Body() createModuleDto: CreateModuleMasterDto,
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'MODULE_MASTER',
    //   'MANAGE_MODULE_MASTER',
    //   'write',
    // );

    return await this.moduleMasterService.CreateModule(
      // this.authService.GetUserFromRequest(req),
      createModuleDto,
    );
  }

  @Patch('update-module')
  async UpdateModule(
    @Req() req: Request,
    @Body() updateModuleDto: UpdateModuleMasterDto,
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'MODULE_MASTER',
    //   'MANAGE_MODULE_MASTER',
    //   'update',
    // );
    return await this.moduleMasterService.UpdateModule(
      // this.authService.GetUserFromRequest(req),
      updateModuleDto,
    );
  }

  @Get('get-module')
  async GetModule(
    @Req() req: Request,
    @Body() { id, customer_id },
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'MODULE_MASTER',
    //   'MANAGE_MODULE_MASTER',
    //   'read',
    // );
    return await this.moduleMasterService.GetModule(
      // this.authService.GetUserFromRequest(req),
      id,
      customer_id,
    );
  }

  @Patch('delete-module')
  async DeleteModule(
    @Req() req: Request,
    @Body() deleteModuleDto: DeleteModuleMasterDto,
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'MODULE_MASTER',
    //   'MANAGE_MODULE_MASTER',
    //   'delete',
    // );
    return await this.moduleMasterService.DeleteModule(
      // this.authService.GetUserFromRequest(req),
      deleteModuleDto,
    );
  }

  @Get('get-all-modules')
  async GetAllUsers() {
    return await this.moduleMasterService.GetAllModules();
  }
}
