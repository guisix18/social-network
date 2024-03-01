import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';

@Injectable()
export class CacheManagementService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async createSession(token: string): Promise<string> {
    if (!token) throw new HttpException('Invalid session', 400);

    const hashedSession = this.generateHash(token);

    await this.cache.set(hashedSession, token, 0);

    return hashedSession;
  }

  async getSession(hash: string) {
    const session = await this.cache.get(hash);

    if (!session) throw new HttpException('Session expired', 400);

    return session;
  }

  private generateHash(token: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(token);

    return hash.digest('hex');
  }
}
