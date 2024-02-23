import { Injectable } from '@nestjs/common';

@Injectable()
export class SimulationServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
