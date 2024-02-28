import {
  BadGatewayException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../src';
import { UserPrivilegeDto } from '../dto/auth.dto';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    console.log(' inside the  RoleGuard');
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      throw new UnauthorizedException();
    }
    const token = request.headers.authorization.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException();
    }
    const CurrentUser = this.authService.getPayloadFromToken(token);
    if (!CurrentUser) {
      throw new UnauthorizedException();
    }

    const handler = context.switchToHttp().getRequest().route.path;
    console.log('route', handler);

    const module = this.reflector.get('module', context.getHandler());
    const submodule = this.reflector.get('submodule', context.getHandler());
    const operation = this.reflector.get('operation', context.getHandler());

    console.log({
      module,
      submodule,
      operation,
    });
    if (!module) {
      throw new BadGatewayException('No module found');
    } else if (!operation) {
      throw new BadGatewayException('No operation found');
    }
    let privileges: UserPrivilegeDto[] = CurrentUser.privileges;
    if (!privileges) {
      throw new ForbiddenException('No privileges given to the user');
    }
    // console.log('privileges', privileges);

    console.log(
      this.CheckPermissionBasedOnRole(privileges, module, submodule, operation),
    );
    return this.CheckPermissionBasedOnRole(
      privileges,
      module,
      submodule,
      operation,
    );
  }

  // check if the user has the required role
  CheckPermissionBasedOnRole(
    privileges: UserPrivilegeDto[],
    module: string,
    submodule: string,
    operation: string,
  ): boolean {
    // console.log('inside CheckPermissionBasedOnRole');
    let IsAllowed = false;

    if (module && submodule && operation) {
      IsAllowed = privileges.some((privilege) => {
        console.log('privilege', privilege);
       
        return (
          privilege.module_name.toLowerCase() === module.toLowerCase() &&
          (privilege.submodule_name == null
            ? ''
            : privilege.submodule_name.toLowerCase()) ===
            submodule.toLowerCase() &&
          privilege.privilege.toLowerCase().includes(operation.toLowerCase())
        );
      });
    }

    return IsAllowed;
  }
}
