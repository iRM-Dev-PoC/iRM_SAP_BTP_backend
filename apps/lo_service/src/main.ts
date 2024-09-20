import { NestFactory } from '@nestjs/core';
import { LoServiceModule } from './lo_service.module';

async function bootstrap() {
  const app = await NestFactory.create(LoServiceModule);

  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  });

  await app.listen(8081, "0.0.0.0");

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
