import { RedisService } from 'src/config/redis.config';
import { RedisRepository } from '../redis/redis.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisUserRepository implements RedisRepository {
  constructor(private readonly redis: RedisService) {}

  async get(key: string): Promise<any> {
    const cachedUsers = await this.redis.get(key);

    return cachedUsers;
  }
  async set(
    key: string,
    data: any,
    secondsToken: any,
    seconds: any,
  ): Promise<any> {
    await this.redis.set(key, data, secondsToken, seconds);
  }
}
