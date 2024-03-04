import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller('sync')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('my-topic') 
  async handleMessage(data: any) {
    console.log('Received message from Kafka:', data);
    await this.appService.processMessage(data);
  }
}
