import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SyncServiceController } from './sync_service.controller';
import { SyncServiceService } from './sync_service.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'SYNC_MICROSERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'sync-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [SyncServiceController],
  providers: [SyncServiceService],
})
export class SyncServiceModule {}
