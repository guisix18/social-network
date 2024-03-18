import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { USER_NOT_FOUND } from 'src/utils/user/exceptions.user';

@Injectable()
export class VerifyUserIdMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(request: Request, response: Response, next: NextFunction) {
    const { userId } = request.params;

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    next();
  }
}
