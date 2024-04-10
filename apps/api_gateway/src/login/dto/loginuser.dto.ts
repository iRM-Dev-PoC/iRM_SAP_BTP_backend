import { IsNotEmpty } from "class-validator";

//#region loginuser

  
export class CreateLoginUserDto {
  id: number; // Include the ID property as an optional integer
  @IsNotEmpty()
  user_id: string; //UUID;
  @IsNotEmpty()
  user_name: string;
  @IsNotEmpty()
  user_email: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  customer_id: string;
  user_emp_id: string;
  @IsNotEmpty()
  created_on: Date;
  @IsNotEmpty()
  created_by: string;
}
  
  export class UpdateLoginUserDto {
    @IsNotEmpty()
    id: string;
    user_name: string;
    user_email: string;
    password: string;
    @IsNotEmpty()
    customer_id_customer_id: string;
    user_emp_id: string;
    changed_on: Date;
    changed_by: string;
  }
  
  export class ReadLoginUserDto {
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    // password: string;
    is_active: string;
    customer_id_id: string;
    user_emp_id: string;
    created_on: Date;
    created_by: string;
    changed_on: Date;
    changed_by: string;
  }
  
  export class DeleteLoginUserDto {
    @IsNotEmpty()
    id: string;
    @IsNotEmpty()
    customer_id: string;
  }
  //#endregion loginuser
  