import {
  Controller,
  ForbiddenException,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { AuthService } from '../auth/src';
import { Request } from 'express';
@Controller('dataload')
// Add module for role-based access control
@UseGuards(JwtAuthGuard)
export class DataLoadController {
  constructor(private authService: AuthService) {}

  //add submodule for role-based access control
  @Get('get-hello')
  getHello(@Req() req: Request) {
    if (!this.authService.validatePrivileges(req, 'dataload', 'dataload_landing_page', 'read')) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return 'Hello from dataload controller!';
  }
}
