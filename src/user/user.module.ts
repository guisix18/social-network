import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserServices } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserServices],
  exports: [UserServices],
})
export class UserModule {}
