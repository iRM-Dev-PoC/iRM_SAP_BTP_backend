import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { use } from 'passport';
import { JwtAuthGuard } from 'libs/auth/guards/jwtAuth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getHello(){
    return this.appService.getHello();
  }
}
