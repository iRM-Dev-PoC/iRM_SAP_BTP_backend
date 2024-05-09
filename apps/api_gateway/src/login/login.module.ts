import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/src";
import { LoginController } from "./login.controller";
import { LoginUserController } from "./loginuser.controller";
import { LoginUserService } from "./loginuser.service";

@Module({
  imports: [AuthModule],
  controllers: [LoginController, LoginUserController],
  providers: [LoginUserService],
})
export class LoginModule {}
