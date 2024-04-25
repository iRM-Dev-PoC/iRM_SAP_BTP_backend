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
import {
  CreateReportCheckPointMappingDto,
  DeleteReportCheckPointMappingDto,
  UpdateReportCheckPointMappingDto,
} from "./dto/report_check_point_mapping.dto";
import { ResponseDto } from '@app/share_lib/common.dto';
import { AuthService } from '../auth/src';
import { Request } from 'express';
import { ReportCheckPointMappingService } from './report_check_point_mapping.service';

@Controller("report-check-point-mapping")
// @UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe())
export class ReportCheckPointMappingController {
  constructor(
    private reportCheckpointMappingService: ReportCheckPointMappingService,
    private authService: AuthService,
  ) {}

  @Post("create-mapping")
  async CreateReportCheckPointMapping(
    @Req() req: Request,
    @Body() createReportCheckPointMappingDto: CreateReportCheckPointMappingDto,
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'MODULE_MASTER',
    //   'MANAGE_MODULE_MASTER',
    //   'write',
    // );

    return await this.reportCheckpointMappingService.CreateReportCheckPointMapping(
      // this.authService.GetUserFromRequest(req),
      createReportCheckPointMappingDto,
    );
  }

  @Patch("update-mapping")
  async UpdateReportCheckPointMapping(
    @Req() req: Request,
    @Body() updateReportCheckPointMappingDto: UpdateReportCheckPointMappingDto,
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'MODULE_MASTER',
    //   'MANAGE_MODULE_MASTER',
    //   'update',
    // );
    return await this.reportCheckpointMappingService.UpdateReportCheckPointMapping(
      // this.authService.GetUserFromRequest(req),
      updateReportCheckPointMappingDto,
    );
  }

  @Get("get-mapping")
  async GetReportCheckPointMapping(
    @Req() req: Request,
    @Body() { id, customer_id },
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'MODULE_MASTER',
    //   'MANAGE_MODULE_MASTER',
    //   'read',
    // );
    return await this.reportCheckpointMappingService.GetReportCheckPointMapping(
      // this.authService.GetUserFromRequest(req),
      id,
      customer_id,
    );
  }

  @Patch("delete-mapping")
  async DeleteReportCheckPointMapping(
    @Req() req: Request,
    @Body() deleteReportCheckPointMappingDto: DeleteReportCheckPointMappingDto,
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'MODULE_MASTER',
    //   'MANAGE_MODULE_MASTER',
    //   'delete',
    // );
    return await this.reportCheckpointMappingService.DeleteReportCheckPointMapping(
      // this.authService.GetUserFromRequest(req),
      deleteReportCheckPointMappingDto,
    );
  }

  @Get("get-all-mappings")
  async GetAllReportCheckPointMappings() {
    return await this.reportCheckpointMappingService.GetAllReportCheckPointMappings();
  }
}
