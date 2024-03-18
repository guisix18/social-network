import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { FILTERS_NOT_FOUND } from 'src/utils/comments/exceptions.comments';

@Injectable()
export class VerifyFiltersMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(request: Request, response: Response, next: NextFunction) {
    const { commentId, postId } = request.query;

    const comment = await this.prisma.comments.findFirst({
      where: {
        id: String(commentId),
      },
    });

    const post = await this.prisma.post.findFirst({
      where: {
        id: String(postId),
      },
    });

    if (!post || !comment) {
      throw new HttpException(FILTERS_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    next();
  }
}
