import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PostsController } from './posts.controller';
import { PostsServices } from './posts.service';
import { VerifyFiltersFeedbacksMiddlewares } from './middleware/verifyFiltersFeedbacks.middleware';
import { PrismaPostRepository } from '../repositories/prisma/prisma.post.repository';
import { PostRepository } from '../repositories/posts/prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PostsController],
  providers: [
    PostsServices,
    PrismaPostRepository,
    {
      provide: PostRepository,
      useClass: PrismaPostRepository,
    },
  ],
  exports: [PostsServices, PrismaPostRepository],
})
export class PostsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyFiltersFeedbacksMiddlewares)
      .forRoutes(
        { path: 'posts/like', method: RequestMethod.PATCH },
        { path: 'posts/dislikes', method: RequestMethod.PATCH },
        { path: 'post/count/likes', method: RequestMethod.GET },
      );
  }
}
