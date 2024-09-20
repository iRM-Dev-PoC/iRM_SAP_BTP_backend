import { Test, TestingModule } from '@nestjs/testing';
import { LoServiceController } from './lo_service.controller';
import { LoServiceService } from './lo_service.service';

describe('LoServiceController', () => {
  let loServiceController: LoServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LoServiceController],
      providers: [LoServiceService],
    }).compile();

    loServiceController = app.get<LoServiceController>(LoServiceController);
  });

  describe('root', () => {
    it('should return "Hello from LO Service!"', () => {
      expect(loServiceController.getHello()).toBe("Hello from LO Service!");
    });
  });
});
