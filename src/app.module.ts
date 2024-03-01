import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { ReporterModule } from './reporter/reporter.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    PostsModule,
    CommentsModule,
    AuthModule,
    ReporterModule,
    ScheduleModule.forRoot(),
    CacheModule.registerAsync({
      useFactory: async (): Promise<CacheModuleOptions | any> => ({
        store: await redisStore({ ttl: 3600 * 1000 }),
      }),
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
