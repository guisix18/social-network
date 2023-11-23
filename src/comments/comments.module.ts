import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsServices } from './comments.service';
import { PostsServices } from 'src/posts/posts.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PostsModule } from 'src/posts/posts.module';
import { VerifyFiltersMiddleware } from './middlewares/verifyFiltersMiddlewares.middleware';

@Module({
  imports: [PrismaModule, PostsModule],
  controllers: [CommentsController],
  providers: [CommentsServices, PostsServices],
  exports: [CommentsServices],
})
export class CommentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyFiltersMiddleware).forRoutes({
      path: '/comments/reply',
      method: RequestMethod.POST,
    });
  }
}
