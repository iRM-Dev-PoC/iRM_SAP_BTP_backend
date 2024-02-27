import { AuthService } from '@app/auth';
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
import { LoginDto } from 'libs/auth/dto/auth.dto';
import { JwtAuthGuard } from 'libs/auth/guards/jwtAuth.guard';
import { LocalGuard } from 'libs/auth/guards/local.guard';

@Controller('auth')
export class LoginController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalGuard)
  @UsePipes(new ValidationPipe())
  async login(@Body() authPayload: LoginDto) {
    return this.authService.validateUser(authPayload);
  }

  @Post('accessendpoints')
  @UseGuards(JwtAuthGuard)
  async accessendpoints(
    @Req() req: Request,
  ) {
    return {'You have access to the endpoints': req.user};
  }
}
