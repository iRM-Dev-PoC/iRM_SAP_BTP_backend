import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateControlFamilyMasterDto {
  id: number;
  @IsNotEmpty()
  control_family_name: string;
  @IsNotEmpty()
  control_family_desc: string;
  @IsNotEmpty()
  customer_id: number;
  created_on: Date;
  created_by: number;
}

export class UpdateControlFamilyMasterDto {
  @IsNotEmpty()
  id: number;
  control_family_name: string;
  control_family_desc: string;
  @IsNotEmpty()
  customer_id: number;
  changed_on: Date;
  changed_by: number;
}

export class ReadControFamilyMasterDto {
  id: number;
  control_family_name: string;
  control_family_desc: string;
  is_active: string;
  created_on: Date;
  created_by: number;
  changed_on: Date;
  changed_by: number;
  customer_id: number;
}

export class DeleteControlFamilyMasterDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  customer_id: number;
  changed_on: Date;
  changed_by: number;
}