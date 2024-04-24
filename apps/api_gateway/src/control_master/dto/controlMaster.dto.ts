import { IsNotEmpty, IsNumber } from 'class-validator';

//#region controlMaster

export class CreateControlMasterDto {
  id: number;
  @IsNotEmpty()
  control_family_id: number;
  @IsNotEmpty()
  control_name: string;
  control_desc: string;
  @IsNotEmpty()
  customer_id: number;
  created_on: Date;
  created_by: number;
}

export class UpdateControlMasterDto {
  @IsNotEmpty()
  id: number;
  control_name: string;
  control_desc: string;
  @IsNotEmpty()
  customer_id: number;
  changed_on: Date;
  changed_by: number;
}

export class ReadControlMasterDto {
  id: number;
  control_name: string;
  control_desc: string;
  control_family_id: number;
  is_active: string;
  created_on: Date;
  created_by: number;
  changed_on: Date;
  changed_by: number;
  customer_id: number;
}

export class DeleteControlMasterDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  customer_id: number;
  changed_on: Date;
  changed_by: number;
}
//#endregion controlMaster
