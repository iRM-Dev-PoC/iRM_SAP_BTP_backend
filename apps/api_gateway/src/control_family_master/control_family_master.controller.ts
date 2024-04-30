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
import { ControlFamilyMasterService } from "./control_family_master.service";
import {
  CreateControlFamilyMasterDto,
  DeleteControlFamilyMasterDto,
  UpdateControlFamilyMasterDto,
} from "./dto/controlFamilyMaster.dto";
import { ResponseDto } from '@app/share_lib/common.dto';
import { AuthService } from '../auth/src';
import { Request } from 'express';

@Controller("control-family-master")
// @UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe())
export class ControlFamilyMasterController {
  constructor(
    private controlFamilyMasterService: ControlFamilyMasterService,
    private authService: AuthService,
  ) {}

  @Post("create-control-family")
  async CreateControl(
    @Req() req: Request,
    @Body() createControlDto: CreateControlFamilyMasterDto,
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'Control_MASTER',
    //   'MANAGE_Control_MASTER',
    //   'write',
    // );

    return await this.controlFamilyMasterService.CreateControl(
      // this.authService.GetUserFromRequest(req),
      createControlDto,
    );
  }

  @Patch("update-control-family")
  async UpdateControl(
    @Req() req: Request,
    @Body() updateControlDto: UpdateControlFamilyMasterDto,
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'Control_MASTER',
    //   'MANAGE_Control_MASTER',
    //   'update',
    // );
    return await this.controlFamilyMasterService.UpdateControl(
      // this.authService.GetUserFromRequest(req),
      updateControlDto,
    );
  }

  @Get("get-control-family")
  async GetControl(
    @Req() req: Request,
    @Body() { id, customer_id },
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'Control_MASTER',
    //   'MANAGE_Control_MASTER',
    //   'read',
    // );
    return await this.controlFamilyMasterService.GetControl(
      // this.authService.GetUserFromRequest(req),
      id,
      customer_id,
    );
  }

  @Patch("delete-control-family")
  async DeleteControl(
    @Req() req: Request,
    @Body() deleteControlDto: DeleteControlFamilyMasterDto,
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'Control_MASTER',
    //   'MANAGE_Control_MASTER',
    //   'delete',
    // );
    return await this.controlFamilyMasterService.DeleteControl(
      // this.authService.GetUserFromRequest(req),
      deleteControlDto,
    );
  }

  @Get("get-all-control-family")
  async GetAllUsers() {
    return await this.controlFamilyMasterService.GetAllControls();
  }
}
