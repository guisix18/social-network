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
import { POST_NOT_FOUND } from 'src/utils/posts/exceptions.posts';

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
    const post = await this.postServices.listOnePost({ postId });

    if (!post) {
      throw new HttpException(POST_NOT_FOUND, 404);
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

  async countCommentsByPost(postId: string): Promise<number> {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    const count = post._count.comments;

    return count;
  }

  async countCommentsByComment(commentId: string): Promise<number> {
    const comment = await this.prisma.comments.findUnique({
      where: {
        id: commentId,
      },
      include: {
        _count: {
          select: {
            children: true,
          },
        },
      },
    });

    const count = comment._count.children;

    return count;
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

  //Acho que vou ter que passar isso para ser uma query, já que prisma não tem o próprio método recursivo
  //não sei até onde é viável uma função recursiva feita assim a mão.
  //Se tratando de performance, testando local obviously não percebo nenhum problema, como seria com múltiplos usuários fazendo essa request?
  //Bom, sei que empresas grandes como as nomeadas Face, Twitter e etc tem um serviço fora desse escopo mas seria legal eu tentar seguir o caminho parecido.
  private formatComment(comment: IComments) {
    const formattedComment: IComments = {
      id: comment.id,
      text: comment.text,
      userId: comment.userId,
      postId: comment.postId,
      parentId: comment.parentId,
      children: [],
    };

    //Basicamente cada vez que um comentário tiver um filho(seria uma resposta), eu monto um comentário priorizando o acima
    //E fazendo com que cada um tenha seu filho, POST A tem COMMENT B que por sua vez COMMENT B tem FILHO C, filho fica
    //No children do COMMMENT B não atrapalhando o que eu queria que fosse retornado(comentários top level)
    if (comment.children) {
      formattedComment.children = comment.children.map((child: IComments) =>
        this.formatComment(child),
      );
    }

    return formattedComment;
  }
}
