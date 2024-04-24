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
import { ReportMasterService } from './report_master.service';
import {
  CreateReportMasterDto,
  DeleteReportMasterDto,
  UpdateReportMasterDto,
} from './dto/reportMaster.dto';
import { ResponseDto } from '@app/share_lib/common.dto';
import { AuthService } from '../auth/src';
import { Request } from 'express';

@Controller('report-master')
// @UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe())
export class ReportMasterController {
  constructor(
    private reportMasterService: ReportMasterService,
    private authService: AuthService,
  ) {}

  @Post('create-report')
  async CreateReport(
    @Req() req: Request,
    @Body() createReportDto: CreateReportMasterDto,
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'Report_MASTER',
    //   'MANAGE_Report_MASTER',
    //   'write',
    // );

    return await this.reportMasterService.CreateReport(
      // this.authService.GetUserFromRequest(req),
      createReportDto,
    );
  }

  @Patch('update-report')
  async UpdateReport(
    @Req() req: Request,
    @Body() updateReportDto: UpdateReportMasterDto,
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'Report_MASTER',
    //   'MANAGE_Report_MASTER',
    //   'update',
    // );
    return await this.reportMasterService.UpdateReport(
      // this.authService.GetUserFromRequest(req),
      updateReportDto,
    );
  }

  @Get('get-report')
  async GetReport(
    @Req() req: Request,
    @Body() { id, customer_id },
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'Report_MASTER',
    //   'MANAGE_Report_MASTER',
    //   'read',
    // );
    return await this.reportMasterService.GetReport(
      // this.authService.GetUserFromRequest(req),
      id,
      customer_id,
    );
  }

  @Patch('delete-report')
  async DeleteReport(
    @Req() req: Request,
    @Body() deleteReportDto: DeleteReportMasterDto,
  ): Promise<ResponseDto> {
    // this.authService.ValidatePrivileges(
    //   req,
    //   'Report_MASTER',
    //   'MANAGE_Report_MASTER',
    //   'delete',
    // );
    return await this.reportMasterService.DeleteReport(
      // this.authService.GetUserFromRequest(req),
      deleteReportDto,
    );
  }

  @Get('get-all-reports')
  async GetAllUsers() {
    return await this.reportMasterService.GetAllReports();
  }
}
