import { NestFactory } from '@nestjs/core';
import { SimulationServiceModule } from './simulation_service.module';

async function bootstrap() {
  const app = await NestFactory.create(SimulationServiceModule);
  await app.listen(3000);
}
bootstrap();
