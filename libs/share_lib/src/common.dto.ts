import { IsNotEmpty, isNotEmpty } from 'class-validator';
import { UUID } from 'crypto';

export class ResponseDto {
  statuscode: any;
  message: string;
  data: any;
  reportdata?: any;
  checkpointdata?: any;
}

export class CurrentUserDto {
  user_id: string;
  user_email: string;
  customer_id: string;
}
// PCF_DB_MODULE_MASTER
export class ModuleDto {
  module_id: UUID;
  module_name: string;
  module_desc: string;
  display_module_name: string;
}
