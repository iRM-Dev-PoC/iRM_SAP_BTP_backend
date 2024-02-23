import { Test, TestingModule } from '@nestjs/testing';
import { SimulationServiceController } from './simulation_service.controller';
import { SimulationServiceService } from './simulation_service.service';

describe('SimulationServiceController', () => {
  let simulationServiceController: SimulationServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SimulationServiceController],
      providers: [SimulationServiceService],
    }).compile();

    simulationServiceController = app.get<SimulationServiceController>(SimulationServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(simulationServiceController.getHello()).toBe('Hello World!');
    });
  });
});
