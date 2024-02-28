import { IsEmail, IsEmpty, IsNotEmpty } from 'class-validator';

export class AuthDto {
  id: number;
  username: string;
  privileges: any[];
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  username: string;
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class UserPrivilegeDto{
  role_name: string;
  module_name: string;
  submodule_name: string;
  privilege: string;
}