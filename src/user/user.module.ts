import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserController } from './user.controller';
import { UserServices } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { VerifyEmailAvailabilityMiddleware } from './middleware/verifyEmailAvailability.middleware';
import { VerifyUserIdMiddleware } from './middleware/verifyUserId.middleware';
import { JwtModule } from '@nestjs/jwt';
import { CacheManagement } from '../cache/cache.service';
import { MailerServices } from '../mailer/mailer.service';
import { MailerServicesModule } from '../mailer/mailer.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_NEW_PASS,
      signOptions: { expiresIn: 400 },
    }),
    MailerServicesModule,
  ],
  controllers: [UserController],
  providers: [UserServices, CacheManagement, MailerServices],
  exports: [UserServices, JwtModule, MailerServices],
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
