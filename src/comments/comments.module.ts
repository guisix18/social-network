import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsServices } from './comments.service';
import { PostsServices } from 'src/posts/posts.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [PrismaModule, PostsModule],
  controllers: [CommentsController],
  providers: [CommentsServices, PostsServices],
  exports: [CommentsServices],
})
export class CommentsModule {}
