import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { EMAIL_ALREADY_EXISTS } from 'src/utils/user/exceptions.user';

@Injectable()
export class VerifyEmailAvailabilityMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(request: Request, response: Response, next: NextFunction) {
    const { email } = request.body;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) throw new HttpException(EMAIL_ALREADY_EXISTS, 409);

    next();
  }
}
