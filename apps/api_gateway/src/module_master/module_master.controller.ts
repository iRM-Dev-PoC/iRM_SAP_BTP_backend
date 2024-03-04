import {
  Controller,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { use } from 'passport';

@Controller('module-master')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe())
export class ModuleMasterController {}
