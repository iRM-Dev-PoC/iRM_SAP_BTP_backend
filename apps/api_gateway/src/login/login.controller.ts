import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { LoginDto } from '../auth/dto/auth.dto';
import { LocalGuard } from '../auth/guards/local.guard';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { AuthService } from '../auth/src';

@Controller('auth')
export class LoginController {
  constructor(private authService: AuthService) {}

  @Post('login')
  // @UseGuards(LocalGuard)
  @UsePipes(new ValidationPipe())
  async login(@Body() authPayload: LoginDto) {
    return this.authService.ValidateUser(authPayload);
  }

  @Post('accessendpoints')
  //@UseGuards(JwtAuthGuard)
  async accessendpoints(@Req() req: Request) {
    return { 'You have access to the endpoints': req.user };
  }

}
