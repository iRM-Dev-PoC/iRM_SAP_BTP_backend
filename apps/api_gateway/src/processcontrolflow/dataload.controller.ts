import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleGuard } from '../auth/guards/role.guard';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
@Controller('dataload')
// Add module for role-based access control
@UseGuards(JwtAuthGuard,RoleGuard)
export class DataLoadController {
  constructor() {}

  //add submodule for role-based access control
  @Get('get_hello')
  @SetMetadata('module', 'dataload')
  @SetMetadata('submodule', '')
  @SetMetadata('operation', 'r')
  getHello() {
    return 'Hello from dataload controller!';
  }
}
