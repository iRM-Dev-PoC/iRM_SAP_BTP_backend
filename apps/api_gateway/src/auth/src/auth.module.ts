import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '../strategies/local.strategy';
import { LocalGuard } from '../guards/local.guard';
import { DatabaseModule } from '@app/share_lib/database/database.module';
import { DatabaseService } from '@app/share_lib/database/database.service';


@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '2h' },
    }),
    DatabaseModule,
  ],
  providers: [AuthService, DatabaseService],
  exports: [AuthService],
})
export class AuthModule {}
