import {
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { Request } from 'express';
import { AuthService } from '../auth/src';
// @UseGuards(JwtAuthGuard)
@Controller('master')
export class MasterController {
  constructor(private authService: AuthService) {}

  //add submodule for role-based access control
  @Get('types-of-control')
  ReadTypeOfControl(@Req() req: Request) {
    if (
      !this.authService.ValidatePrivileges(
        req,
        'master',
        'types_of_control',
        'read',
      )
    ) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return {
      submodule: 'types_of_control',
      operation: 'read',
    };
  }

  @Post('types-of-control')
  WriteTypeOfControl(@Req() req: Request) {
    if (
      !this.authService.ValidatePrivileges(
        req,
        'master',
        'types_of_control',
        'create',
      )
    ) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return {
      submodule: 'types_of_control',
      operation: 'create',
    };
  }

  @Get('control-family')
  ReadControlFamily(@Req() req: Request) {
    if (
      !this.authService.ValidatePrivileges(req, 'master', 'control_family', 'read')
    ) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }

    return {
      submodule: 'control_family',
      operation: 'read',
    };
  }

  @Get('control-attribute')
  ReadControlAttribute(@Req() req: Request) {
    if (
      !this.authService.ValidatePrivileges(
        req,
        'master',
        'control_attribute',
        'read',
      )
    ) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return {
      submodule: 'control_attribute',
      operation: 'read',
    };
  }

  @Get('report')
  ReadReport(@Req() req: Request) {
    if (!this.authService.ValidatePrivileges(req, 'master', 'report', 'read')) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return {
      submodule: 'report',
      operation: 'read',
    };
  }

  @Get('control-logic')
  ReadControlLogic(@Req() req: Request) {
    if (
      !this.authService.ValidatePrivileges(req, 'master', 'control_logic', 'read')
    ) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return {
      submodule: 'control_logic',
      operation: 'read',
    };
  }
}
