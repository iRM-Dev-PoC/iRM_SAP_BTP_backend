import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../auth/src';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { diskStorage } from 'multer';

@Controller('dataload')
export class DataLoadController {
  constructor(private authService: AuthService) {}

  @Get('get-hello')
  getHello(@Req() req: Request) {
    if (
      !this.authService.ValidatePrivileges(
        req,
        'dataload',
        'dataload_landing_page',
        'read',
      )
    ) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return 'Hello from dataload controller!';
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, process.env.UPLOAD_DEST);
        },
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.xlsx', '.xls', '.csv'];
        const extname = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(extname)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    console.log(file);

    return { message: 'File uploaded successfully' };
  }
}