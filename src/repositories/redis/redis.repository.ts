export abstract class RedisRepository {
  abstract get(key: string): Promise<any>;
  abstract set(
    key: string,
    data: any,
    secondsToken: any,
    seconds: any,
  ): Promise<any>;
}
