import { HttpException, Injectable } from '@nestjs/common';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { PostsServices } from 'src/posts/posts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentsDto } from './dto/comments.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { select } from 'src/utils/comments/select.comments';
import { FiltersCommentsDto } from './dto/filtersComments.dto';
import { IComments } from './interface/comments.interface';

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
    const { commentId, postId, parentId } = filters;

    const data: Prisma.CommentsCreateInput = {
      id: randomUUID(),
      text: dto.text,
      parent: {
        connect: { id: parentId ? parentId : commentId },
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
        id: commentId,
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

  async getCommentsByPost(postId: string): Promise<CommentsDto[]> {
    const topLevelComments = await this.prisma.comments.findMany({
      where: {
        postId,
        parentId: null,
      },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
    });

    return topLevelComments.map((comment) => this.formatComment(comment));
  }

  private formatComment(comment: IComments) {
    const formattedComment: IComments = {
      id: comment.id,
      text: comment.text,
      userId: comment.userId,
      postId: comment.postId,
      parentId: comment.parentId,
      children: [],
    };

    if (comment.children) {
      formattedComment.children = comment.children.map((child) =>
        this.formatComment(child),
      );
    }

    return formattedComment;
  }
}
