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
@Controller('configuration')
export class ConfigurationController {
  constructor(private authService: AuthService) {}
  @Get('add_roles')
  ReadAddRoles(@Req() req: Request) {
    if (
      !this.authService.validatePrivileges(
        req,
        'configuration',
        'add_roles',
        'r',
      )
    ) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    // console.log('inside the ReadAddRoles', req.headers.authorization);
    return {
      submodule: 'add_roles',
      operation: 'r',
    };
  }

  @Get('add_users')
  ReadAddUsers(@Req() req: Request) {
    if (
      !this.authService.validatePrivileges(
        req,
        'configuration',
        'add_users',
        'r',
      )
    ) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return {
      submodule: 'add_users',
      operation: 'r',
    };
  }
}
