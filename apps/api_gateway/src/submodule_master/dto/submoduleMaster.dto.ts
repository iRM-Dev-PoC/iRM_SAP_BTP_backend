//#region moduleMaster

import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSubModuleMasterDto {
  id: number;
  @IsNotEmpty()
  submodule_name: string;
  submodule_desc: string;
  @IsNumber()
  @IsNotEmpty()
  parent_module_id: number;
  @IsNotEmpty()
  display_submodule_name: string;
  @IsNotEmpty()
  customer_id: number;
  created_on: Date;
  created_by: number;
}

export class UpdateSubModuleMasterDto {
  @IsNotEmpty()
  id: number;
  submodule_name: string;
  submodule_id: string;
  submodule_desc: string;
  @IsNumber()
  parent_module_id: number;
  display_submodule_name: string;
  @IsNotEmpty()
  customer_id: number;
  changed_on: Date;
  changed_by: number;
}

export class ReadSubModuleMasterDto {
  id: number;
  display_module_name: string;
  module_desc: string;
  parent_module_id: number;
  is_active: string;
  created_on: Date;
  created_by: number;
  changed_on: Date;
  changed_by: number;
  customer_id: number;
}

export class DeleteSubModuleMasterDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  customer_id: number;
  changed_on: Date;
  changed_by: number;
}
//#endregion moduleMaster
