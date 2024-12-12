import { type RedisClientType, createClient } from 'redis';
import Container, { Service } from 'typedi';
import 'reflect-metadata';

import { LoggingService } from '@/app/services/LoggingService';

@Service()
export class CacheService {
  private static client: RedisClientType;
  private loggingService: LoggingService;

  constructor() {
    this.loggingService = Container.get(LoggingService);
  }

  public async connect() {
    await this.getClient();
  }

  private async getClient() {
    if (CacheService.client) {
      return CacheService.client;
    }
    CacheService.client = await createClient();
    await CacheService.client.connect();
    return CacheService.client;
  }

  public async getFromCacheOnly(key: string) {
    const redis = await this.getClient();
    return redis.get(key);
  }

  public async cachedFunctionCall<T>(
    cacheKey: string,
    durationInSeconds: number,
    func: () => Promise<T>
  ): Promise<T> {
    const redis = await this.getClient();

    const cachedResult = await redis.GET(cacheKey);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }
    try {
      const value = await func();
      await redis.SETEX(cacheKey, durationInSeconds, JSON.stringify(value));
      return value;
    } catch (e) {
      this.loggingService.error(
        `Error Executing cached function call. No cache was stored for ${cacheKey}`,
        e
      );
      throw e;
    }
  }
}
