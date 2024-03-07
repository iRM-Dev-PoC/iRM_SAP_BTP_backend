import { Injectable } from '@nestjs/common';
import cds from '@sap/cds';
import { Client } from 'pg';
import * as fs from 'fs';

@Injectable()
export class AppService {
  private client: Client;
  constructor() {
    // this.client.connect();
    // console.log(this.client)
    // console.log(fs.readFileSync('rds-combined-ca-bundle.pem').toString());
  }

  async getHello() {
    // let { User_role_mapping } = cds.entities;
    // let data = await cds.run(`SELECT ID,
    //                           user_id_id as user_id,
    //                           (SELECT USER_NAME  FROM public.pcf_db_login_user WHERE ID=user_id_id)
    //                           AS USER_NAME,role_id_id as role_id,
    //                           (SELECT ROLE_NAME  FROM public.pcf_db_role_master WHERE ID=role_id_id) AS USER_ROLE
    //                           FROM ${User_role_mapping}`);
    // console.log(data);

    // let data = await cds.run(`SELECT * FROM tbl_student`);
    try {
      let localclient = new Client({
        user: '1accda00c2d9',
        password: '2d2c144eeba7ea296e',
        database: 'QuLwWYimfdJT',
        host: '127.0.0.1',
        port: 5433,
        uri: 'postgres://1accda00c2d9:2d2c144eeba7ea296e@127.0.0.1:5433/QuLwWYimfdJT',
        ssl: {
          rejectUnauthorized: false,
        },
      });
      let dockerclient = new Client({
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
      });
      let ssl = {
        rejectUnauthorized: false,
        ca: fs.readFileSync('rds-combined-ca-bundle.pem').toString(),
      };
      let cloudclient = new Client({
        user: '1accda00c2d9',
        password: '2d2c144eeba7ea296e',
        database: 'QuLwWYimfdJT',
        host: 'postgres-cfede104-831e-4cb0-b136-71f53273fec1.cqryblsdrbcs.us-east-1.rds.amazonaws.com',
        port: 1943,
        uri: 'postgres://71a0d95cd0be:f61e7986009c6c5b658b75fe20decd@postgres-cfede104-831e-4cb0-b136-71f53273fec1.cqryblsdrbcs.us-east-1.rds.amazonaws.com:1943/QuLwWYimfdJT',
        ssl: ssl,
      });
      this.client = dockerclient;
      // let d = await cds.run(`SELECT * FROM tbl_student`);
      // console.log(d);
      await this.client.connect();
      //  console.log(this.client);
      // let data = await this.client.query('SELECT * FROM pcf_db_login_user');
      let data = await this.client.query('SELECT * FROM pcf_db_login_user');

      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
