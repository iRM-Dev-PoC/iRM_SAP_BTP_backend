import { Module } from '@nestjs/common';
import { LoServiceController } from './lo_service.controller';
import { LoServiceService } from './lo_service.service';
import { licenseOptimizationModule } from './license_optimization/licenseOptimization.module';
import { DashboardModule } from './license_optimization/dashboard/dashboard.module';

@Module({
  imports: [licenseOptimizationModule, DashboardModule],
  controllers: [LoServiceController],
  providers: [LoServiceService],
})
export class LoServiceModule {}
