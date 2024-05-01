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
import { RedisService } from '../config/redis.config';
import { UserRepository } from '../repositories/user/user.repository';
import { PrismaUserRepository } from '../repositories/prisma/prisma.user.repository';
import { RedisUserRepository } from '../repositories/cache/redis-user-cache.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'MAILER_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'mailer',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'mailer-consumer',
          },
        },
      },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_NEW_PASS,
      signOptions: { expiresIn: 400 },
    }),
  ],
  controllers: [UserController],
  providers: [
    UserServices,
    RedisService,
    PrismaUserRepository,
    RedisUserRepository,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [UserServices, JwtModule, PrismaUserRepository],
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
