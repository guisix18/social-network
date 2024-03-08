import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, lastValueFrom, of } from 'rxjs';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();

    const authorizationHeader = request.headers.authorization;

    console.log(authorizationHeader);

    const cacheKey = `cache_${authorizationHeader}`;
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      return of(cachedData);
    }

    const result = await lastValueFrom(next.handle());

    await this.cacheManager.set(cacheKey, result, 60 * 60 * 1000); // Exemplo de TTL de 1 hora

    return of(result);
  }
}
