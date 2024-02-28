import {
  Controller,
  ForbiddenException,
  Get,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { RoleGuard } from '../auth/guards/role.guard';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { AuthService } from '../auth/src';
import { Request } from 'express';
@Controller('dataload')
// Add module for role-based access control
@UseGuards(JwtAuthGuard)
export class DataLoadController {
  constructor(private authService: AuthService) {}

  //add submodule for role-based access control
  @Get('get_hello')
  getHello(@Req() req: Request) {
    if (!this.authService.validatePrivileges(req, 'dataload', '', 'r')) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return 'Hello from dataload controller!';
  }
}
