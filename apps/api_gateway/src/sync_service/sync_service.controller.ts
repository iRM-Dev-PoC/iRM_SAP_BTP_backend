import { Controller, Post, Body } from '@nestjs/common';
import { SyncServiceService } from './sync_service.service';


@Controller('api')
export class SyncServiceController {
  constructor(private readonly syncServiceService: SyncServiceService) {}

  @Post('send-message')
  async sendMessage(@Body('message') message: string) {
    await this.syncServiceService.sendMessage(message);
    return { success: true };
  }
}
