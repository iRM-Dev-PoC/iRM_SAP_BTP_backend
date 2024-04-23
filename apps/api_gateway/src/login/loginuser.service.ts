import { HttpStatus, Injectable } from "@nestjs/common";
import cds from "@sap/cds";
import {
  CreateLoginUserDto,
  DeleteLoginUserDto,
  UpdateLoginUserDto,
} from "./dto/loginuser.dto";
import { DatabaseService } from "@app/share_lib/database/database.service";
import { CurrentUserDto, ResponseDto } from "@app/share_lib/common.dto";
import { AppService } from "../app.service";
import { generateHash, validateHash } from "../auth/utils/passwordValidation";

@Injectable()
export class LoginUserService {
  constructor(
    private databaseService: DatabaseService,
    private readonly appService: AppService,
    // private jwtservice: JwtService,
  ) {}

  async CreateUser(
    //currentUser: CurrentUserDto,
    createUserDto: CreateLoginUserDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");
      const tableName = "PCF_DB_LOGIN_USER";

      // Fetch existing UMP_IDs for the given customer_id
      const umpIdsQuery = `SELECT USER_EMP_ID FROM ${tableName} WHERE CUSTOMER_ID = ${createUserDto.customer_id}`;
      const umpIdsResult = await db.run(umpIdsQuery);

      let maxEmp = 0;
      umpIdsResult.forEach((row: { USER_EMP_ID: string }) => {
        const empNumber = parseInt(row.USER_EMP_ID.split("-").pop() || "0");
        if (empNumber > maxEmp) {
          maxEmp = empNumber;
        }
      });

      // Increment EMP number
      maxEmp++;

      // Construct UMP_ID
      const umpId = `CUST-${createUserDto.customer_id}-EMP-${maxEmp}`;
      createUserDto.user_emp_id = umpId;

      // Generate hash for password
      const { hash, salt } = generateHash(createUserDto.password);

      // Prepare user data for insertion
      const userData = {
        USER_NAME: createUserDto.user_name,
        USER_EMAIL: createUserDto.user_email,
        PASSWORD: hash,
        USER_EMP_ID: createUserDto.user_emp_id,
        ROLE_ID: createUserDto.role_id,
        CUSTOMER_ID: createUserDto.customer_id,
        CREATED_BY: 1,
        DESIGNATION: createUserDto.designation,
        SALT: salt,
      };

      // Insert user into the database
      await INSERT.into(tableName).entries(userData);

      return {
        statuscode: HttpStatus.CREATED,
        message: "User created successfully",
        data: createUserDto,
      };
    } catch (error) {
      return {
        statuscode: HttpStatus.BAD_REQUEST,
        message: "Error while creating user",
        data: error,
      };
    }
  }


  async UpdateUser(
    // currentUser: CurrentUserDto,
    updateLoginUser: UpdateLoginUserDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      updateLoginUser.changed_on = new Date();
      updateLoginUser.changed_by = 2;

      if (updateLoginUser.user_name || updateLoginUser.user_email) {
        const whereClause = cds.parse.expr(
          `ID != '${updateLoginUser.id}' AND (USER_NAME = '${updateLoginUser.user_name}' OR USER_EMAIL = '${updateLoginUser.user_email}') AND IS_ACTIVE = 'Y'`,
        );

        const existingUser = await db
          .read("PCF_DB_LOGIN_USER")
          .where(whereClause);

        if (existingUser && existingUser.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: "User already exists",
            data: existingUser,
          };
        }
      }

      const updatedUser = await UPDATE("PCF_DB_LOGIN_USER")
        .set({
          USER_NAME: updateLoginUser.user_name,
          USER_EMAIL: updateLoginUser.user_email,
          CHANGED_ON: updateLoginUser.changed_on.toISOString(),
          CHANGED_BY: updateLoginUser.changed_by,
        })
        .where({
          ID: updateLoginUser.id,
          CUSTOMER_ID: updateLoginUser.customer_id,
          USER_EMP_ID: updateLoginUser.user_emp_id,
          IS_ACTIVE: "Y",
        });

      return {
        statuscode: HttpStatus.OK,
        message: "User updated successfully",
        data: updateLoginUser,
      };
    } catch (error) {
      return {
        statuscode: HttpStatus.BAD_REQUEST,
        message: "Error while updating user",
        data: error,
      };
    }
  }

  async ReadLoginUser(
    // currentUser: CurrentUserDto,
    id: number,
    customer_id: number,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      const whereClause = cds.parse.expr(`ID = '${id}' AND IS_ACTIVE = 'Y'`);

      const user = await db.read("PCF_DB_LOGIN_USER").where(whereClause);

      if (!user || user.length === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: "User not found",
          data: user,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "User fetched successfully",
        data: user,
      };
    } catch (error) {
      return {
        statuscode: HttpStatus.BAD_REQUEST,
        message: "Error while fetching user",
        data: error,
      };
    }
  }

  async DeleteLoginUser(
    // currentUser: CurrentUserDto,
    deleteLoginUser: DeleteLoginUserDto,
  ) {
    try {
      const db = await cds.connect.to("db");

      deleteLoginUser.changed_on = new Date();
      deleteLoginUser.changed_by = 3;

      const affectedRows = await UPDATE("PCF_DB_LOGIN_USER")
        .set({
          IS_ACTIVE: "N",
          CHANGED_ON: deleteLoginUser.changed_on.toISOString(),
          CHANGED_BY: deleteLoginUser.changed_by,
        })
        .where({
          ID: deleteLoginUser.id,
          CUSTOMER_ID: deleteLoginUser.customer_id,
          IS_ACTIVE: "Y",
        });

      if (affectedRows == 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: "User not found for deletion",
          data: null,
        };
      }
      return {
        status: HttpStatus.OK,
        message: "User deleted successfully",
        data: affectedRows,
      };
    } catch (error) {
      return {
        status: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async GetAllUsers() // readAllLoginUserDto: ReadAllLoginUserDto,
  : Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      const whereClause = cds.parse.expr(`IS_ACTIVE = 'Y'`);

      const users = await db
        .read("PCF_DB_LOGIN_USER")
        .columns(
          "ID",
          "USER_NAME",
          "USER_EMAIL",
          "USER_EMP_ID",
          "CUSTOMER_ID",
          "CREATED_ON",
          "CREATED_BY",
          "CHANGED_ON",
          "CHANGED_BY",
          "ROLE_ID",
          "DESIGNATION",
        )
        .where(whereClause);

      console.log("users", users);

      if (!users || users.length === 0) {
        return {
          statuscode: HttpStatus.OK,
          message: "No users found",
          data: users,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: "Users fetched successfully",
        data: users,
      };
    } catch (error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error fetching users",
        data: null,
      };
    }
  }
}
