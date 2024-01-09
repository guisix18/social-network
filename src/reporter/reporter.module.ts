import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReporterController } from './reporter.controller';
import { ReporterService } from './reporter.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReporterController],
  providers: [ReporterService],
  exports: [ReporterService],
})
export class ReporterModule {}
