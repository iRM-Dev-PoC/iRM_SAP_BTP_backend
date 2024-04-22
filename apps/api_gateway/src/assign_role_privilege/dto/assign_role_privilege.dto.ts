import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAssignRolePrivilegeDto {
  id: number;
  @IsNotEmpty()
  @IsNumber()
  role_id: number;

  @IsNotEmpty()
  @IsNumber()
  module_id: number;

  @IsNotEmpty()
  @IsNumber()
  submodule_id: number;

  @IsNotEmpty()
  @IsNumber()
  privilege_id: number;
  @IsNotEmpty()
  @IsNumber()
  customer_id: number;

  privilege_flag: string;

  created_on: Date;
  created_by: number;
}

export class GetRoleModuleSubmodulePrivilegeMappingDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  customer_id: number;
}

export class UpdateRoleModuleSubmodulePrivilegeMappingDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  customer_id: number;

  @IsNotEmpty()
  @IsNumber()
  role_id: number;

  @IsNotEmpty()
  @IsNumber()
  module_id: number;

  @IsNotEmpty()
  @IsNumber()
  submodule_id: number;

  @IsNotEmpty()
  @IsNumber()
  privilege_id: number;

  updated_on: Date;
  updated_by: number;
}

export class CreateAssignRoleToUserDto {
  id: number;

  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsNotEmpty()
  @IsNumber()
  role_id: number;

  created_on: Date;
  created_by: number;

  @IsNotEmpty()
  @IsNumber()
  customer_id: number;
}

export class GetRoleOfUserDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsNotEmpty()
  @IsNumber()
  customer_id: number;
}

export class UpdateRoleOfUserDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsNotEmpty()
  @IsNumber()
  customer_id: number;

  @IsNotEmpty()
  @IsNumber()
  role_id: number;

  changed_on: Date;
  changed_by: number;
}

export class DeleteRoleFromUserDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsNotEmpty()
  @IsNumber()
  role_id: number;

  @IsNotEmpty()
  @IsNumber()
  customer_id: number;
}
