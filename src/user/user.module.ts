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
import { VerifyUserIdMiddleware } from './middleware/verifyUserId.middleware';
import { CacheManagementService } from 'src/cache/cache.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserServices, CacheManagementService],
  exports: [UserServices],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyEmailAvailabilityMiddleware)
      .forRoutes({ path: '/user', method: RequestMethod.POST });

    consumer
      .apply(VerifyUserIdMiddleware)
      .forRoutes(
        { path: '/user/update/:userId', method: RequestMethod.PATCH },
        { path: '/user/deactivate/:userId', method: RequestMethod.PATCH },
        { path: '/user/activate/:userId', method: RequestMethod.PATCH },
      );
  }
}
