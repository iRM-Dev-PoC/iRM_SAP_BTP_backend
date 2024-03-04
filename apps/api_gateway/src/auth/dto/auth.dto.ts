import { IsEmail, IsNotEmpty } from 'class-validator';

export class Privilege {
  role_id: number;
  role_name: string;
  module_name: string;
  submodule_name: string;
  display_module_name: string;
  display_submodule_name: string;
  privilege: string;
}

export class AuthDto {
  user_id: number;
  username: string;
  customer_id: number;
  privileges: Privilege[];
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  username: string;
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class UserPrivilegeDto {
  role_name: string;
  module_name: string;
  submodule_name: string;
  privilege: string;
}
