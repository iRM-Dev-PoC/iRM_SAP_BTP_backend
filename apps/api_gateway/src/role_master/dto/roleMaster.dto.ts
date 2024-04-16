import { IsNotEmpty } from 'class-validator';

export class CreateRoleMasterDto {
  id: number;
  @IsNotEmpty()
  role_name: string;
  role_desc: string;
  role_permission: string;
  created_on: Date;
  created_by: number;
  @IsNotEmpty()
  customer_id: number;
}

export class UpdateRoleMasterDto {
  @IsNotEmpty()
  id: number;
  role_name: string;
  role_desc: string;
  changed_on: Date;
  changed_by: number;
  @IsNotEmpty()
  customer_id: number;
}

export class ReadRoleMasterDto {
  id: number;
  role_name: string;
  role_desc: string;
  is_active: string;
  created_on: Date;
  created_by: number;
  changed_on: Date;
  changed_by: number;
  customer_id: number;
}

export class DeleteRoleMasterDto {
  @IsNotEmpty()
  id: number;
//   @IsNotEmpty()
  customer_id: number;
}
