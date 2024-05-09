import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/src";
import { ModuleMasterController } from "./module_master.controller";
import { ModuleMasterService } from "./module_master.service";

@Module({
  imports: [AuthModule],
  providers: [ModuleMasterService],
  controllers: [ModuleMasterController],
})
export class ModuleMasterModule {}
