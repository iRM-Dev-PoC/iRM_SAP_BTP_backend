import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleGuard } from '../auth/guards/role.guard';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
@UseGuards(JwtAuthGuard,RoleGuard)
@Controller('dashboard')
// Add metadata
export class DashboardController {
  constructor() {}

  @Get('get_hello')
  @SetMetadata('module', 'dashboard')
  @SetMetadata('submodule', '')
  @SetMetadata('operation', 'r')
  getHello() {
    return 'Hello from dashboard controller!';
  }
}
