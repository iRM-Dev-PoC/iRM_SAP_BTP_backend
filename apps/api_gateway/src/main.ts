// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import * as hanaClient from '@sap/hana-client';
// import * as hanaOptions from '../../../default-env.json';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
  
//   const connParams = {
//     serverNode: hanaOptions.host + ':' + hanaOptions.port,
//     uid: hanaOptions.user,
//     pwd: hanaOptions.password,
//     ca: hanaOptions.certificate,
//     encrypt: true,
//     // sslValidateCertificate: true,
//     connectTimeout: 60000,
//   };

//   // console.log(`param : ${connParams}`);

//   try {
//     //  connection = hanaClient.createConnection();
//     const connection = hanaClient.createConnection();
//     // await connection.connect(connParams);

//     connection.connect(connParams, (err) => {
//       if (err) console.error(err);
//       // connection.exec(
//       //   `SELECT * FROM ${defaultENV.schema}.PCF_DB_CONTROL_FAMILY_MASTER`,
//       //   (error, result) => {
//       //     if (error) console.error(error);
//       //     console.log(result);
//       //   },
//       // );
//     });
//     console.log(' hello------Connected to SAP HANA database');
//   } catch (error) {
//     console.error('Error connecting to SAP HANA database:', error);
//   }
//   await app.listen(8080);
//   console.log(`Application is running on: ${await app.getUrl()}`);
// }
// bootstrap();


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(8080);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();