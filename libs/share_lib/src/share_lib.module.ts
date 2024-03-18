import { Module } from '@nestjs/common';
import { ShareLibService } from './share_lib.service';
import { PrismaService } from './prisma.service';
import { ExcelService } from './excel.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CSVService } from './csv.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'public') }),
  ],
  providers: [ShareLibService, PrismaService, ExcelService, CSVService],
  exports: [ShareLibService, PrismaService, ExcelService, CSVService],
})
export class ShareLibModule {}
