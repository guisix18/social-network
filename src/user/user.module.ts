import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserController } from './user.controller';
import { UserServices } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VerifyEmailAvailabilityMiddleware } from './middleware/verifyEmailAvailability.middleware';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserServices],
  exports: [UserServices],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyEmailAvailabilityMiddleware)
      .forRoutes({ path: '/user', method: RequestMethod.POST });
  }
}
