import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheManagement {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async getCache(key: string) {
    return await this.cache.get(key);
  }

  async createCache(key: string, data: any) {
    return await this.cache.set(key, data, 60 * 60 * 1000);
  }
}
