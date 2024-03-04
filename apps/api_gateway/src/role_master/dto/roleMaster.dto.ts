import { IsNotEmpty } from "class-validator";

export class CreateRoleMasterDto {
    role_id: string; //UUID;
    @IsNotEmpty()
    role_name: string;
    role_desc: string;
    created_on: Date;
    created_by: string;
    @IsNotEmpty()
    customer_id_id: string;
}

export class UpdateRoleMasterDto {
    @IsNotEmpty()
    id: string;
    role_name: string;
    role_id: string;
    role_desc: string;
    changed_on: Date;
    changed_by: string;
    @IsNotEmpty()
    customer_id_id: string;
}

export class ReadRoleMasterDto {
    id: string;
    role_id: string;
    role_name: string;
    role_desc: string;
    is_active: string;
    created_on: Date;
    created_by: string;
    changed_on: Date;
    changed_by: string;
    customer_id_id: string;
}

export class DeleteRoleMasterDto {
    @IsNotEmpty()
    id: string;
    @IsNotEmpty()
    customer_id: string;
}