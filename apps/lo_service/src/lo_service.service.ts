import { Injectable } from '@nestjs/common';

@Injectable()
export class LoServiceService {
  getHello(): string {
    return 'Hello from LO Service!';
  }
}
