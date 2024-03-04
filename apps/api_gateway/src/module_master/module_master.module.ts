import { Module } from '@nestjs/common';
import { ModuleMasterService } from './module_master.service';
import { ModuleMasterController } from './module_master.controller';
import { AuthModule } from '../auth/src';

@Module({
  imports: [AuthModule],
  providers: [ModuleMasterService],
  controllers: [ModuleMasterController],
})
export class ModuleMasterModule {}
