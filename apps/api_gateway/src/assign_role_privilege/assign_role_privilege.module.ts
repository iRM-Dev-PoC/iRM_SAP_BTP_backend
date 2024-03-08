import { Module } from '@nestjs/common';
import { AssignRolePrivilegeController } from './assign_role_privilege.controller';
import { AssignRolePrivilegeService } from './assign_role_privilege.service';
import { AuthModule } from '../auth/src';

@Module({
  imports: [AuthModule],
  controllers: [AssignRolePrivilegeController],
  providers: [AssignRolePrivilegeService]
})
export class AssignRolePrivilegeModule {}
