import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReporterController } from './reporter.controller';
import { ReporterService } from './reporter.service';
import { UserModule } from 'src/user/user.module';
import { UserServices } from 'src/user/user.service';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [ReporterController],
  providers: [ReporterService, UserServices],
  exports: [ReporterService],
})
export class ReporterModule {}
