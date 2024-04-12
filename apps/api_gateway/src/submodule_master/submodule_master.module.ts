import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/src';
import { SubmoduleMasterController } from './submodule_master.controller';
import { SubmoduleMasterService } from './submodule_master.service';
import { DatabaseModule } from '@app/share_lib/database/database.module';
import { DatabaseService } from '@app/share_lib/database/database.service';
import { AppService } from '../app.service';

@Module({
    imports: [AuthModule, DatabaseModule],
    controllers: [SubmoduleMasterController],
    providers: [SubmoduleMasterService, DatabaseService, AppService],
})
export class SubmoduleMasterModule {}
