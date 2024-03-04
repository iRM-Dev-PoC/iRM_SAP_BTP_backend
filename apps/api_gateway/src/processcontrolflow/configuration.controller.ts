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
@Controller('configuration')
export class ConfigurationController {
  constructor(private authService: AuthService) {}
  @Get('add-roles')
  ReadAddRoles(@Req() req: Request) {
    if (
      !this.authService.ValidatePrivileges(
        req,
        'configuration',
        'add_roles',
        'read',
      )
    ) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    // console.log('inside the ReadAddRoles', req.headers.authorization);
    return {
      submodule: 'add_roles',
      operation: 'read',
    };
  }

  @Get('add_users')
  ReadAddUsers(@Req() req: Request) {
    if (
      !this.authService.ValidatePrivileges(
        req,
        'configuration',
        'add_users',
        'read',
      )
    ) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return {
      submodule: 'add_users',
      operation: 'read',
    };
  }
}
