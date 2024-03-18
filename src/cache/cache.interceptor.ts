import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { CacheManagement } from './cache.service';
import { Response } from 'express';
import { AuthRequest } from '../auth/models/AuthRequest';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CacheManagement) private readonly cacheManagement: CacheManagement,
  ) {}
  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request: AuthRequest = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    const user = request.user;

    const cache_key = `${request.url}-${request.method}-${user.id}`;

    const cache = await this.cacheManagement.getCache(cache_key);

    if (cache) return response.json(cache);

    return next.handle();
  }
}
