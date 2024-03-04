import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class SyncServiceService {
  constructor(@Inject('SYNC_MICROSERVICE') private kafkaClient: ClientKafka) {}

  async sendMessage(message: string) {
    await this.kafkaClient.emit('my-topic', { message });
  }
}
