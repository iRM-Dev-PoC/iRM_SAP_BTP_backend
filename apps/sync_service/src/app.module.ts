import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'SYNC_MICROSERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'sync',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'sync-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
