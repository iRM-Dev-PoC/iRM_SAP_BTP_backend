import { DataSource } from 'typeorm';
import * as fs from 'fs';

const serviceKeyJson = JSON.parse(fs.readFileSync('./pcf-sk.json', 'utf-8'));

// console.log(serviceKeyJson.sslcert.certificate_base64);
// console.log(serviceKeyJson.sslcert.replaceAll('\n', ''));
const ssl = {
  ca: serviceKeyJson.sslcert
    .replaceAll('BEGIN CERTIFICATE', '')
    .replaceAll('END CERTIFICATE', '')
    .replaceAll('-', ''),
  //   ssl: true,
  rejectUnauthorized: false,
};

// export default new DataSource({
//   type: 'postgres',
//   host: serviceKeyJson.host,
//   port: serviceKeyJson.port,
//   username: serviceKeyJson.username,
//   password: serviceKeyJson.password,
//   database: serviceKeyJson.name,
//   ssl,
//   entities: ['dist/**/*.entity{.ts,.js}'],
//   synchronize: false, // Don't forget to disable synchronize in production
// });
// export default new DataSource({
//   type: 'postgres',
//   host: "localhost",
//   port: 5432,
//   username: "postgres",
//   password: "1234",
//   database: "postgres",
// //   ssl,
//   entities: ['dist/**/*.entity{.ts,.js}'],
//   synchronize: false, // Don't forget to disable synchronize in production
// });
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: serviceKeyJson.host,
  port: serviceKeyJson.port,
  username: serviceKeyJson.username,
  password: serviceKeyJson.password,
  database: serviceKeyJson.name,
//   ssl,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: false, // Don't forget to disable synchronize in production
  retryAttempts: 2,
  extra: {
    trustServerCertificate: true,
  },
};
