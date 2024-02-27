import { AuthService } from '@app/auth';
import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginDto } from 'libs/auth/dto/auth.dto';

@Controller('auth')
export class LoginController {

  constructor(private authService:AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() authPayload: LoginDto) {
    return this.authService.validateUser(authPayload);
  }
}
