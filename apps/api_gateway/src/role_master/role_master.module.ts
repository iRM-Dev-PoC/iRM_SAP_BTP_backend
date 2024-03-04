import { Module } from '@nestjs/common';
import { RoleMasterController } from './role_master.controller';
import { RoleMasterService } from './role_master.service';
import { AuthModule } from '../auth/src';

@Module({
  imports: [AuthModule],
  controllers: [RoleMasterController],
  providers: [RoleMasterService]
})
export class RoleMasterModule {}
