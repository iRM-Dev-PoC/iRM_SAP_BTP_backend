import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/src';
import { SubmoduleMasterController } from './submodule_master.controller';
import { SubmoduleMasterService } from './submodule_master.service';

@Module({
    imports: [AuthModule],
    controllers: [SubmoduleMasterController],
    providers: [SubmoduleMasterService],
})
export class SubmoduleMasterModule {}
