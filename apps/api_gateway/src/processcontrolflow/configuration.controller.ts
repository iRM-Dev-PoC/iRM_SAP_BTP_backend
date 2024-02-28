import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleGuard } from '../auth/guards/role.guard';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';

@UseGuards(JwtAuthGuard,RoleGuard)
@Controller('configuration')
export class ConfigurationController {
  @Get('add_roles')
  @SetMetadata('module', 'configuration')
  @SetMetadata('submodule', 'add_roles')
  @SetMetadata('operation', 'r')
  ReadAddRoles() {
    return {
      submodule: 'add_roles',
      operation: 'r',
    };
  }

  @Get('add_users')
  @SetMetadata('module', 'configuration')
  @SetMetadata('submodule', 'add_users')
  @SetMetadata('operation', 'r')
  ReadAddUsers() {
    return {
      submodule: 'add_users',
      operation: 'r',
    };
  }
}
