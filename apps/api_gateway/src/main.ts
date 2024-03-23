import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cds from '@sap/cds';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const pdb = await cds.connect
    .to('db')
    .then((db) => {
      console.log('connected to db');
    })
    .catch((err) => {
      console.log('error connecting to db', err);
    });
  await app.listen(8080);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
