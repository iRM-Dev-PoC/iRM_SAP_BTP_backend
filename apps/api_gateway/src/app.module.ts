import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { ServicesModule } from './services/services.module';
import { ConfigModule } from '@nestjs/config';
import { LoginModule } from './login/login.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), 
    // ServicesModule,
     LoginModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
