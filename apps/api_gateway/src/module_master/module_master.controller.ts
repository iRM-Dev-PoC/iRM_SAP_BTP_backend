import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { use } from 'passport';
import { ModuleMasterService } from './module_master.service';
import {
  CreateModuleMasterDto,
  DeleteModuleMasterDto,
  ReadModuleMasterDto,
  UpdateModuleMasterDto,
} from './dto/moduleMaster.dto';
import { CurrentUserDto, ResponseDto } from '@app/share_lib/common.dto';
import { AuthService } from '../auth/src';

@Controller('module-master')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe())
export class ModuleMasterController {
  constructor(
    private moduleMasterService: ModuleMasterService,
    private authService: AuthService,
  ) {}

  @Post('create-module')
  async CreateModule(
    @Req() req: Request,
    @Body() createModuleDto: CreateModuleMasterDto,
  ): Promise<ResponseDto> {
    return await this.moduleMasterService.CreateModule(
      this.authService.GetUserFromRequest(req),
      createModuleDto,
    );
  }

  @Post('update-module')
  async UpdateModule(
    @Req() req: Request,
    @Body() updateModuleDto: UpdateModuleMasterDto,
  ): Promise<ResponseDto> {
    return await this.moduleMasterService.UpdateModule(
      this.authService.GetUserFromRequest(req),
      updateModuleDto,
    );
  }

  @Post('get-module')
  async GetModule(@Req() req:Request,@Body() { id, customer_id }): Promise<ResponseDto> {
    return await this.moduleMasterService.GetModule(this.authService.GetUserFromRequest(req), id, customer_id);
  }

  @Post('delete-module')
  async DeleteModule(@Req() req:Request,@Body() deleteModuleDto: DeleteModuleMasterDto): Promise<ResponseDto> {
    return await this.moduleMasterService.DeleteModule(this.authService.GetUserFromRequest(req), deleteModuleDto);
  }
}
