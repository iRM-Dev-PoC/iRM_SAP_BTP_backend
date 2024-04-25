import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateReportCheckPointMappingDto {
  id: number;
  @IsNotEmpty()
  report_id: number;
  @IsNotEmpty()
  check_point_id: number;
  @IsNotEmpty()
  customer_id: number;
  created_on: Date;
  created_by: number;
}

export class UpdateReportCheckPointMappingDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  report_id: number;
  @IsNotEmpty()
  check_point_id: number;
  @IsNotEmpty()
  customer_id: number;
  changed_on: Date;
  changed_by: number;
}

export class ReadReportCheckPointMappingDto {
  id: number;
  report_id: number;
  check_point_id: number;
  customer_id: number;
  is_active: string;
  created_on: Date;
  created_by: number;
  changed_on: Date;
  changed_by: number;
}

export class DeleteReportCheckPointMappingDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  customer_id: number;
  changed_on: Date;
  changed_by: number;
}