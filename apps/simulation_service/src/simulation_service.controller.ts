import { Controller, Get } from '@nestjs/common';
import { SimulationServiceService } from './simulation_service.service';

@Controller()
export class SimulationServiceController {
  constructor(private readonly simulationServiceService: SimulationServiceService) {}

  @Get()
  getHello(): string {
    return this.simulationServiceService.getHello();
  }
}
