import {
  HttpStatus,
  Injectable,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { CurrentUserDto, ResponseDto } from '@app/share_lib/common.dto';
import {
  CreateAssignRolePrivilegeDto,
  CreateAssignRoleToUserDto,
  DeleteRoleFromUserDto,
  GetRoleModuleSubmodulePrivilegeMappingDto,
  GetRoleOfUserDto,
  UpdateRoleModuleSubmodulePrivilegeMappingDto,
  UpdateRoleOfUserDto,
} from './dto/assign_role_privilege.dto';
import cds from '@sap/cds';
import { get } from 'http';

@Injectable()
@UsePipes(new ValidationPipe())
// @UseGuards(JwtAuthGuard)
export class AssignRolePrivilegeService {
  constructor() {}

  async InsertRoleModuleSubmodulePrivilegeMapping(
    // currentUser: CurrentUserDto,
    createRoleModuleSubmodulePrivilegeMappingDto: CreateAssignRolePrivilegeDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      createRoleModuleSubmodulePrivilegeMappingDto.created_on = new Date();
      createRoleModuleSubmodulePrivilegeMappingDto.created_by = 1; // current user id
      console.log(createRoleModuleSubmodulePrivilegeMappingDto);

      if (
        createRoleModuleSubmodulePrivilegeMappingDto.role_id &&
        createRoleModuleSubmodulePrivilegeMappingDto.module_id &&
        createRoleModuleSubmodulePrivilegeMappingDto.submodule_id &&
        createRoleModuleSubmodulePrivilegeMappingDto.privilege_id
      ) {
        const whereClause = cds.parse.expr(`
        ROLE_ID = '${createRoleModuleSubmodulePrivilegeMappingDto.role_id}' AND
        MODULE_ID = '${createRoleModuleSubmodulePrivilegeMappingDto.module_id}' AND
        SUBMODULE_ID = '${createRoleModuleSubmodulePrivilegeMappingDto.submodule_id}' AND
        PRIVILEGE_ID = '${createRoleModuleSubmodulePrivilegeMappingDto.privilege_id}' AND
        CUSTOMER_ID = '${createRoleModuleSubmodulePrivilegeMappingDto.customer_id}' AND
        IS_ACTIVE = 'Y'
      `);

        const existingMapping = await db
          .read("PCF_DB_ROLE_MODULE_SUBMODULE_MAPPING")
          .where(whereClause);

        if (existingMapping && existingMapping.length > 0) {
          return {
            statuscode: HttpStatus.CONFLICT,
            message: "This mapping already exists",
            data: existingMapping,
          };
        }
      }

      const createdMapping = await db.run(
        INSERT.into("PCF_DB_ROLE_MODULE_SUBMODULE_MAPPING").entries(
          createRoleModuleSubmodulePrivilegeMappingDto,
        ),
      );

      if (createdMapping) {
        return {
          statuscode: HttpStatus.CREATED,
          message: "Role Module Submodule Privilege mapped successfully",
          data: createRoleModuleSubmodulePrivilegeMappingDto,
        };
      } else {
        return {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Role Module Submodule Privilege mapping failed",
          data: null,
        };
      }
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async GetRoleModuleSubmodulePrivilegeMapping(
    // currentUser: CurrentUserDto,
    getRoleModuleSubmodulePrivilegeMappingDto: GetRoleModuleSubmodulePrivilegeMappingDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      const whereClause = cds.parse.expr(`
      ID = '${getRoleModuleSubmodulePrivilegeMappingDto.id}' AND
      CUSTOMER_ID = '${getRoleModuleSubmodulePrivilegeMappingDto.customer_id}' AND
      IS_ACTIVE = 'Y'
    `);

      let result = await db
        .read("PCF_DB_ROLE_MODULE_SUBMODULE_MAPPING")
        .where(whereClause);

      if (result && result.length > 0) {
        return {
          statuscode: HttpStatus.OK,
          message: "Role Module Submodule Privilege fetched successfully",
          data: result,
        };
      } else {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: "Role Module Submodule Privilege mapping not found",
          data: null,
        };
      }
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async UpdateRoleModuleSubmodulePrivilegeMapping(
    // currentUser: CurrentUserDto,
    updateRoleModuleSubmodulePrivilegeMappingDto: UpdateRoleModuleSubmodulePrivilegeMappingDto,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      // Check if the mapping already exists
      let existingMapping = await db
        .read("PCF_DB_ROLE_MODULE_SUBMODULE_MAPPING")
        .where({
          role_id: updateRoleModuleSubmodulePrivilegeMappingDto.role_id,
          module_id: updateRoleModuleSubmodulePrivilegeMappingDto.module_id,
          submodule_id:
            updateRoleModuleSubmodulePrivilegeMappingDto.submodule_id,
          privilege_id:
            updateRoleModuleSubmodulePrivilegeMappingDto.privilege_id,
          customer_id: updateRoleModuleSubmodulePrivilegeMappingDto.customer_id,
        });

      if (existingMapping && existingMapping.length > 0) {
        return {
          statuscode: HttpStatus.CONFLICT,
          message: "This map already exists",
          data: existingMapping,
        };
      }

      // Update the mapping
      let result = await db
        .update("PCF_DB_ROLE_MODULE_SUBMODULE_MAPPING")
        .set({
          CHANGED_ON: new Date(),
          CHANGED_BY: 2, // Assuming this is the current user ID
        })
        .where({
          id: updateRoleModuleSubmodulePrivilegeMappingDto.id,
          customer_id: updateRoleModuleSubmodulePrivilegeMappingDto.customer_id,
          IS_ACTIVE: "Y",
        });

      if (result) {
        return {
          statuscode: HttpStatus.OK,
          message: "Role Module Submodule Privilege updated successfully",
          data: updateRoleModuleSubmodulePrivilegeMappingDto,
        };
      } else {
        return {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Role Module Submodule Privilege update failed",
          data: null,
        };
      }
    } catch (error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
        data: null,
      };
    }
  }

  async DeleteRoleModuleSubmodulePrivilegeMapping(
    // currentUser: CurrentUserDto,
    id: number,
    customer_id: number,
  ): Promise<ResponseDto> {
    try {
      const db = await cds.connect.to("db");

      // Update the mapping to mark it as inactive
      let result = await db
        .update("PCF_DB_ROLE_MODULE_SUBMODULE_MAPPING")
        .set({
          IS_ACTIVE: "N",
          CHANGED_ON: new Date(),
          CHANGED_BY: 3, // Assuming this is the current user ID
        })
        .where({
          id: id,
          customer_id: customer_id,
        });

      if (result) {
        return {
          statuscode: HttpStatus.OK,
          message: "Role Module Submodule Privilege deleted successfully",
          data: result,
        };
      } else {
        return {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Role Module Submodule Privilege delete failed",
          data: null,
        };
      }
    } catch (error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
        data: null,
      };
    }
  }

  //role assign to user

  async AssignRoleToUser(
    // currentUser: CurrentUserDto,
    createAssignRoleToUserDto: CreateAssignRoleToUserDto,
  ) {
    try {
      // Connect to the database
      const db = await cds.connect.to("db");

      // Check if the role is already assigned to the user
      let existingRoleAssignment = await db
        .read("PCF_DB_USER_ROLE_MAPPING")
        .where({
          role_id: createAssignRoleToUserDto.role_id,
          user_id: createAssignRoleToUserDto.user_id,
          customer_id: createAssignRoleToUserDto.customer_id,
          IS_ACTIVE: "Y",
        });

      // If the role assignment already exists, return conflict status
      if (existingRoleAssignment.length > 0) {
        return {
          statuscode: HttpStatus.CONFLICT,
          message: "This role is already assigned to the user",
          data: existingRoleAssignment,
        };
      }

      // Set created_on and created_by fields
      createAssignRoleToUserDto.created_on = new Date();
      createAssignRoleToUserDto.created_by = 1; // Assuming this is the current user id

      // Insert the role assignment
      let result = await db.insert([
        { entity: "PCF_DB_USER_ROLE_MAPPING", ...createAssignRoleToUserDto },
      ]);


      // If insertion is successful, return success status
      if (result) {
        return {
          statuscode: HttpStatus.CREATED,
          message: "Role assigned to user successfully",
          data: createAssignRoleToUserDto,
        };
      } else {
        // If insertion fails, return internal server error status
        return {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Role assigned to user failed",
          data: null,
        };
      }
    } catch (error) {
      // If an error occurs, return internal server error status along with the error message
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
        data: null,
      };
    }
  }

  async GetRoleOfUser(
    // currentUser: CurrentUserDto,
    getRoleOfUserDto: GetRoleOfUserDto,
  ) {
    try {
      const db = await cds.connect.to("db");

      // Set the customer_id (assuming it's retrieved from the current user)
      getRoleOfUserDto.customer_id = 1; //current user customer id

      // Fetch the role of the user from the database
      let result = await db.run(
        `SELECT user_id,(SELECT USER_EMAIL FROM PCF_DB_LOGIN_USER WHERE ID=user_id),role_id,(SELECT ROLE_NAME FROM PCF_DB_ROLE_MASTER WHERE ID=role_id) FROM PCF_DB_USER_ROLE_MAPPING WHERE user_id='${getRoleOfUserDto.user_id}' AND customer_id='${getRoleOfUserDto.customer_id}' AND IS_ACTIVE='Y'`,
      );

      if (result.length > 0) {
        return {
          statuscode: HttpStatus.OK,
          message: "Role fetched successfully",
          data: result,
        };
      } else {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: "Role not found",
          data: null,
        };
      }
    } catch (error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
        data: null,
      };
    }
  }

  async UpdateRoleOfUser(
    // currentUser: CurrentUserDto,
    updateRoleOfUserDto: UpdateRoleOfUserDto,
  ) {
    try {
      const db = await cds.connect.to("db");

      // Check if the role is already assigned to the user
      let existingResult = await db.run(
        SELECT.from("PCF_DB_USER_ROLE_MAPPING").where(
          `user_id ='${updateRoleOfUserDto.user_id}' AND role_id='${updateRoleOfUserDto.role_id}' AND customer_id='${updateRoleOfUserDto.customer_id}' AND IS_ACTIVE='Y'`,
        ),
      );

      if (existingResult.length > 0) {
        return {
          statuscode: HttpStatus.CONFLICT,
          message: "This role is already assigned to this user",
          data: existingResult,
        };
      }

      // Update the role of the user
      let result = await db.run(
        UPDATE("PCF_DB_USER_ROLE_MAPPING")
          .set({
            role_id: updateRoleOfUserDto.role_id,
            CHANGED_ON: new Date(),
            CHANGED_BY: 2,
          })
          .where(
            `user_id ='${updateRoleOfUserDto.user_id}' AND customer_id='${updateRoleOfUserDto.customer_id}' AND IS_ACTIVE='Y'`,
          ),
      );

      if (result) {
        return {
          statuscode: HttpStatus.OK,
          message: "Role updated successfully",
          data: updateRoleOfUserDto,
        };
      } else {
        return {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Role update failed",
          data: null,
        };
      }
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }

  async RemoveRoleFromUser(
    currentUser: CurrentUserDto,
    deleteRoleFromUserDto: DeleteRoleFromUserDto,
  ) {
    try {
      const db = await cds.connect.to("db");

      // Update the role of the user to mark it as inactive
      let result = await db.run(
        UPDATE("PCF_DB_USER_ROLE_MAPPING")
          .set({
            IS_ACTIVE: "N",
            CHANGED_ON: new Date(),
            CHANGED_BY: currentUser.user_id,
          })
          .where(
            `user_id ='${deleteRoleFromUserDto.user_id}' AND role_id='${deleteRoleFromUserDto.role_id}' AND customer_id='${deleteRoleFromUserDto.customer_id}' AND IS_ACTIVE='Y'`,
          ),
      );

      if (result) {
        return {
          statuscode: HttpStatus.OK,
          message: "Role removed successfully",
          data: result,
        };
      } else {
        return {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Role remove failed",
          data: null,
        };
      }
    } catch (error) {
      return {
        statuscode: error.status,
        message: error.message,
        data: null,
      };
    }
  }
}
