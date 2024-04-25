import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCheckPointMasterDto {
  id: number;
  @IsNotEmpty()
  check_point_name: string;
  check_point_desc: string;
  @IsNotEmpty()
  customer_id: number;
  @IsNotEmpty()
  control_id: number;
  created_on: Date;
  created_by: number;
}

export class UpdateCheckPointMasterDto {
  @IsNotEmpty()
  id: number;
  check_point_name: string;
  check_point_desc: string;
  @IsNotEmpty()
  customer_id: number;
  changed_on: Date;
  changed_by: number;
}

export class ReadCheckPointMasterDto {
  id: number;
  check_point_name: string;
  check_point_desc: string;
  is_active: string;
  created_on: Date;
  created_by: number;
  changed_on: Date;
  changed_by: number;
  customer_id: number;
  control_id: number;
}

export class DeleteCheckPointMasterDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  customer_id: number;
  changed_on: Date;
  changed_by: number;
}