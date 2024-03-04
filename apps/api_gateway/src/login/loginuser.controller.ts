import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';

import { LoginUserService } from './loginuser.service';
import { AuthService } from '../auth/src';
import { CreateLoginUserDto, DeleteLoginUserDto, UpdateLoginUserDto } from './dto/loginuser.dto';

@Controller('loginuser')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe())
export class LoginUserController {
  constructor(
    private loginUserService: LoginUserService,
    private authService: AuthService,
  ) {}
  @Post('create-user')
  async CreateUser(
    @Req() req: Request,
    @Body() createUserDto: CreateLoginUserDto,
  ) {
    return await this.loginUserService.CreateUser(
      this.authService.GetUserFromRequest(req),
      createUserDto,
    );
  }

  @Post('update-user')
  async UpdateUser(
    @Req() req: Request,
    @Body() updateLoginUser: UpdateLoginUserDto,
  ) {
    return await this.loginUserService.UpdateUser(
      this.authService.GetUserFromRequest(req),
      updateLoginUser,
    );
  }

  @Post('get-user')
  async ReadUser(@Req() req: Request, @Body() { id, customer_id }) {
    return await this.loginUserService.ReadLoginUser(
      this.authService.GetUserFromRequest(req),
      id,
      customer_id,
    );
  }

  @Post('delete-user')
  async DeleteUser(
    @Req() req: Request,
    @Body() deleteLoginUser: DeleteLoginUserDto,
  ) {
    return await this.loginUserService.DeleteLoginUser(
      this.authService.GetUserFromRequest(req),
      deleteLoginUser,
    );
  }
}
