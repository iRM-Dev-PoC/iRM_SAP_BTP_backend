// microservice.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async processMessage(data: any) {

    console.log('Processing message:', data);
  }
}
