import { IsNotEmpty, IsNumber } from 'class-validator';

//#region moduleMaster

export class CreateModuleMasterDto {
  id: number;
  module_id: string; //UUID;

  @IsNotEmpty()
  module_name: string;
  module_desc: string;
  @IsNumber()
  parent_module_id_id: number;

  @IsNotEmpty()
  display_module_name: string;

  // @IsNotEmpty()
  customer_id_id: string;
  created_on: Date;
  created_by: string;
}

export class UpdateModuleMasterDto {
  @IsNotEmpty()
  id: number;

  module_id: string;
  module_desc: string;
  // @IsNumber()
  parent_module_id_id: number;
  display_module_name: string;

  // @IsNotEmpty()
  customer_id_id: string;
  changed_on: Date;
  changed_by: string;
}

export class ReadModuleMasterDto {
  id: number;
  module_id: string;
  display_module_name: string;
  module_desc: string;
  parent_module_id_id: string;
  is_active: string;
  created_on: Date;
  created_by: string;
  changed_on: Date;
  changed_by: string;
  customer_id_id: string;
}

export class DeleteModuleMasterDto {
  @IsNotEmpty()
  id: number;
  // @IsNotEmpty()
  customer_id: string;
}
//#endregion moduleMaster
