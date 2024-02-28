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
@Controller('master')
export class MasterController {
  constructor(private authService: AuthService) {}

  //add submodule for role-based access control
  @Get('types_of_control')
  ReadTypeOfControl(@Req() req: Request) {
    if (
      !this.authService.validatePrivileges(
        req,
        'master',
        'types_of_control',
        'r',
      )
    ) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return {
      submodule: 'types_of_control',
      operation: 'r',
    };
  }

  @Get('types_of_control')
  WriteTypeOfControl(@Req() req: Request) {
    if (
      !this.authService.validatePrivileges(
        req,
        'master',
        'types_of_control',
        'w',
      )
    ) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return {
      submodule: 'types_of_control',
      operation: 'r',
    };
  }

  @Get('control_family')
  ReadControlFamily(@Req() req: Request) {
    if (
      !this.authService.validatePrivileges(req, 'master', 'control_family', 'r')
    ) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }

    return {
      submodule: 'control_family',
      operation: 'r',
    };
  }

  @Get('control_attribute')
  ReadControlAttribute(@Req() req: Request) {
    if (
      !this.authService.validatePrivileges(
        req,
        'master',
        'control_attribute',
        'r',
      )
    ) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return {
      submodule: 'control_attribute',
      operation: 'r',
    };
  }

  @Get('report')
  ReadReport(@Req() req: Request) {
    if (!this.authService.validatePrivileges(req, 'master', 'report', 'r')) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return {
      submodule: 'report',
      operation: 'r',
    };
  }

  @Get('control_logic')
  ReadControlLogic(@Req() req: Request) {
    if (
      !this.authService.validatePrivileges(req, 'master', 'control_logic', 'r')
    ) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return {
      submodule: 'control_logic',
      operation: 'r',
    };
  }
}
