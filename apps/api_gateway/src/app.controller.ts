import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('random')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getData() {
    try {
      const result = await this.appService.someMethod();
      return result; 
    } catch (error) {
      return { error: error.message };
    }
  }
}
