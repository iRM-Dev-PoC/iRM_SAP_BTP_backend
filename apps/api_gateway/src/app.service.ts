import { Injectable } from '@nestjs/common';
import cds from '@sap/cds';

@Injectable()
export class AppService {
  async getHello() {
    let { User_role_mapping } = cds.entities;
    let data = await cds.run(`SELECT ID,
                              user_id_id as user_id,
                              (SELECT USER_NAME  FROM public.pcf_db_login_user WHERE ID=user_id_id)
                              AS USER_NAME,role_id_id as role_id,
                              (SELECT ROLE_NAME  FROM public.pcf_db_role_master WHERE ID=role_id_id) AS USER_ROLE 
                              FROM ${User_role_mapping}`);
    console.log(data);

    return data;
  }
}
