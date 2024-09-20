import { Controller, Get } from '@nestjs/common';
import { LoServiceService } from './lo_service.service';

@Controller('lo')
export class LoServiceController {
  constructor(private readonly loServiceService: LoServiceService) {}

  @Get()
  getHello(): string {
    return this.loServiceService.getHello();
  }
}
