import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { POST_NOT_FOUND } from 'src/utils/posts/exceptions.posts';

@Injectable()
export class VerifyFiltersFeedbacksMiddlewares implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(request: Request, response: Response, next: NextFunction) {
    const { postId } = request.query;

    const post = await this.prisma.post.findUnique({
      where: {
        id: String(postId),
      },
    });

    if (!post) throw new HttpException(POST_NOT_FOUND, 404);

    next();
  }
}
