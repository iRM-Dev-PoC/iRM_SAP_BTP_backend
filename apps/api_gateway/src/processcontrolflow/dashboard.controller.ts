import {
  Controller,
  ForbiddenException,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { Request } from 'express';
import { AuthService } from '../auth/src';
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
// Add metadata
export class DashboardController {
  constructor(private authService: AuthService) {}

  @Get('get-hello')
  getHello(@Req() req: Request) {
    if (!this.authService.validatePrivileges(req, 'dashboard', 'landing_page', 'create')) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return 'Hello from dashboard controller!';
  }
}
