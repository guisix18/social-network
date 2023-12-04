import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PostsController } from './posts.controller';
import { PostsServices } from './posts.service';
import { VerifyFiltersFeedbacksMiddlewares } from './middleware/verifyFiltersFeedbacks.middleware';

@Module({
  imports: [PrismaModule],
  controllers: [PostsController],
  providers: [PostsServices],
  exports: [PostsServices],
})
export class PostsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyFiltersFeedbacksMiddlewares)
      .forRoutes(
        { path: 'posts/like', method: RequestMethod.PATCH },
        { path: 'posts/dislikes', method: RequestMethod.PATCH },
      );
  }
}
