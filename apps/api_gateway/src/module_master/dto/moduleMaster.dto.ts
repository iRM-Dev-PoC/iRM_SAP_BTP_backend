import { IsNotEmpty, IsNumber } from 'class-validator';

//#region moduleMaster

export class CreateModuleMasterDto {
  id: number;
  @IsNotEmpty()
  module_name: string;
  module_desc: string;
  @IsNumber()
  parent_module_id: number;

  @IsNotEmpty()
  display_module_name: string;

  @IsNotEmpty()
  customer_id: number;
  created_on: Date;
  created_by: number;
}

export class UpdateModuleMasterDto {
  @IsNotEmpty()
  id: number;
  module_desc: string;
  @IsNumber()
  parent_module_id: number;
  display_module_name: string;
  @IsNotEmpty()
  customer_id: number;
  changed_on: Date;
  changed_by: number;
}

export class ReadModuleMasterDto {
  id: number;
  display_module_name: string;
  module_desc: string;
  parent_module_id: string;
  is_active: string;
  created_on: Date;
  created_by: number;
  changed_on: Date;
  changed_by: number;
  customer_id: number;
}

export class DeleteModuleMasterDto {
  @IsNotEmpty()
  id: number;
  // @IsNotEmpty()
  customer_id: string;
}
//#endregion moduleMaster
