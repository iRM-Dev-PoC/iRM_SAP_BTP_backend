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
import { Request } from 'express';
import { AuthService } from '../auth/src';
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
// Add metadata
export class DashboardController {
  constructor(private authService: AuthService) {}

  @Get('get_hello')
  getHello(@Req() req: Request) {
    if (!this.authService.validatePrivileges(req, 'dashboard', '', 'r')) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return 'Hello from dashboard controller!';
  }
}
