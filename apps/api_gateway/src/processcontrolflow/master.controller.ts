import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleGuard } from '../auth/guards/role.guard';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
@UseGuards(JwtAuthGuard,RoleGuard)
@Controller('master')
export class MasterController {
  constructor() {}

  //add submodule for role-based access control
  @Get('types_of_control')
  @SetMetadata('module', 'master')
  @SetMetadata('submodule', 'types_of_control')
  @SetMetadata('operation', 'r')
  ReadTypeOfControl() {
    return {
      submodule: 'types_of_control',
      operation: 'r',
    };
  }

  @Get('control_family')
  @SetMetadata('module', 'master')
  @SetMetadata('submodule', 'control_family')
  @SetMetadata('operation', 'r')
  ReadControlFamily() {
    return {
      submodule: 'control_family',
      operation: 'r',
    };
  }

  @Get('control_attribute')
  @SetMetadata('module', 'master')
  @SetMetadata('submodule', 'control_attribute')
  @SetMetadata('operation', 'r')
  ReadControlAttribute() {
    return {
      submodule: 'control_attribute',
      operation: 'r',
    };
  }

  @Get('report')
  @SetMetadata('module', 'master')
  @SetMetadata('submodule', 'report')
  @SetMetadata('operation', 'r')
  ReadReport() {
    return {
      submodule: 'report',
      operation: 'r',
    };
  }

  @Get('control_logic')
  @SetMetadata('module', 'master')
  @SetMetadata('submodule', 'control_logic')
  @SetMetadata('operation', 'r')
  ReadControlLogic() {
    return {
      submodule: 'control_logic',
      operation: 'r',
    };
  }
}
