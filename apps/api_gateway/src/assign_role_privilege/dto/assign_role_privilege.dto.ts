import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAssignRolePrivilegeDto {
  @IsNotEmpty()
  @IsString()
  role_id_id: string;

  @IsNotEmpty()
  @IsString()
  module_id_id: string;

  @IsNotEmpty()
  @IsString()
  submodule_id_id: string;

  @IsNotEmpty()
  @IsString()
  privilege_id_id: string;

  created_on: Date;
  created_by: string;

  @IsNotEmpty()
  @IsString()
  customer_id_id: string;
}

export class GetRoleModuleSubmodulePrivilegeMappingDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  customer_id_id: string;
}

export class UpdateRoleModuleSubmodulePrivilegeMappingDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  customer_id_id: string;

  @IsNotEmpty()
  @IsString()
  role_id_id: string;

  @IsNotEmpty()
  @IsString()
  module_id_id: string;

  @IsNotEmpty()
  @IsString()
  submodule_id_id: string;

  @IsNotEmpty()
  @IsString()
  privilege_id_id: string;

  updated_on: Date;
  updated_by: string;
}

export class CreateAssignRoleToUserDto {
  @IsNotEmpty()
  @IsString()
  role_id_id: string;

  @IsNotEmpty()
  @IsString()
  user_id_id: string;

  created_on: Date;
  created_by: string;

  @IsNotEmpty()
  @IsString()
  customer_id_id: string;
}

export class GetRoleOfUserDto {
  @IsNotEmpty()
  @IsString()
  user_id_id: string;

  @IsNotEmpty()
  @IsString()
  customer_id_id: string;
}

export class UpdateRoleOfUserDto{
  @IsNotEmpty()
  @IsString()
  user_id_id: string;

  @IsNotEmpty()
  @IsString()
  customer_id_id: string;

  @IsNotEmpty()
  @IsString()
  role_id_id: string;

  changed_on: Date;
  changed_by: string;
}

export class DeleteRoleFromUserDto {
  @IsNotEmpty()
  @IsString()
  user_id_id: string;

  @IsNotEmpty()
  @IsString()
  role_id_id: string;

  @IsNotEmpty()
  @IsString()
  customer_id_id: string;
}
