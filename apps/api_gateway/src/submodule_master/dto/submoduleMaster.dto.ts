
//#region moduleMaster

import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateSubModuleMasterDto {
    id: number;
    submodule_id: string; //UUID;
  
    @IsNotEmpty()
    submodule_name: string;
    submodule_desc: string;
    @IsNumber()
    // @IsNotEmpty()
    parent_module_id_id: number;
  
    @IsNotEmpty()
    display_submodule_name: string;
  
    // @IsNotEmpty()
    customer_id_id: string;
    created_on: Date;
    created_by: string;
  }
  
  export class UpdateSubModuleMasterDto {
    @IsNotEmpty()
    id: number;
    submodule_name: string;
    submodule_id: string;
    submodule_desc: string;
    @IsNumber()
    parent_module_id_id: number;
    display_submodule_name: string;

    // @IsNotEmpty()
    customer_id_id: string;
    changed_on: Date;
    changed_by: string;
  }
  
  export class ReadSubModuleMasterDto {
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
  
  export class DeleteSubModuleMasterDto {
    @IsNotEmpty()
    id: number;
    // @IsNotEmpty()
    customer_id: string;
  }
  //#endregion moduleMaster
  