import { HttpException, Injectable } from '@nestjs/common';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { PostsServices } from 'src/posts/posts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentsDto } from './dto/comments.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { select } from 'src/utils/comments/select.comments';
import { FiltersCommentsDto } from './dto/filtersComments.dto';

@Injectable()
export class CommentsServices {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postServices: PostsServices,
  ) {}

  async postingComments(
    dto: CommentsDto,
    user: UserFromJwt,
    postId: string,
  ): Promise<CommentsDto> {
    const post = await this.postServices.listOnePost(postId);

    if (!post) {
      throw new HttpException('Post not found or do not exists', 404);
    }

    const data: Prisma.CommentsCreateInput = {
      id: randomUUID(),
      text: dto.text,
      post: {
        connect: { id: postId },
      },
      user: {
        connect: { id: user.id },
      },
    };

    const comment = await this.prisma.comments.create({
      data,
    });

    return comment;
  }

  async listComments(): Promise<CommentsDto[]> {
    return await this.prisma.comments.findMany({
      select,
    });
  }

  async replyingComments(
    dto: CommentsDto,
    filters: FiltersCommentsDto,
    user: UserFromJwt,
  ) {
    const { commentId, postId } = filters;

    const comment = await this.prisma.comments.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) throw new HttpException('Comment not found', 404);

    const data: Prisma.CommentsCreateInput = {
      id: randomUUID(),
      text: dto.text,
      parent: {
        connect: { id: comment.id },
      },
      post: {
        connect: { id: postId },
      },
      user: {
        connect: { id: user.id },
      },
    };

    const reply = await this.prisma.comments.create({
      data,
    });

    await this.prisma.comments.update({
      where: {
        id: comment.id,
      },
      data: {
        children: {
          connect: {
            id: reply.id,
          },
        },
      },
    });

    return reply;
  }
}
