import { IsNotEmpty } from 'class-validator';

//#region loginuser

export class CreateLoginUserDto {
  id: number;
  @IsNotEmpty()
  user_name: string;
  @IsNotEmpty()
  user_email: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  customer_id: number;
  user_emp_id: string;
  @IsNotEmpty()
  created_on: Date;
  @IsNotEmpty()
  created_by: number;
}

export class UpdateLoginUserDto {
  @IsNotEmpty()
  id: number;
  user_name: string;
  user_email: string;
  password: string;
  @IsNotEmpty()
  customer_id: number;
  user_emp_id: number;
  changed_on: Date;
  changed_by: number;
}

export class ReadLoginUserDto {
  id: number;
  user_name: string;
  user_email: string;
  // password: string;
  is_active: string;
  customer_id: string;
  user_emp_id: string;
  created_on: Date;
  created_by: number;
  changed_on: Date;
  changed_by: number;
}

export class DeleteLoginUserDto {
  @IsNotEmpty()
  id: number;
  // @IsNotEmpty()
  customer_id: string;
}
//#endregion loginuser
