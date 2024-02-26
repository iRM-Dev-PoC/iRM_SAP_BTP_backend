import { Body, Controller, Post } from '@nestjs/common';

@Controller('auth')
export class LoginController {
  @Post('login')
  async login(@Body() Body: any) {
    return 'login';
  }
}
