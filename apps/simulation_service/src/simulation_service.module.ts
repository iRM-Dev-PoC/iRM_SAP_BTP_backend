import { Module } from '@nestjs/common';
import { SimulationServiceController } from './simulation_service.controller';
import { SimulationServiceService } from './simulation_service.service';

@Module({
  imports: [],
  controllers: [SimulationServiceController],
  providers: [SimulationServiceService],
})
export class SimulationServiceModule {}
