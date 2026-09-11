import { Injectable } from '@nestjs/common';
import { SharedCacheService } from '@spark-nest-ed/infrastructure-cache';

@Injectable()
export class ListeningCacheService {
  constructor(private readonly cache: SharedCacheService) {}

  async get<T>(key: string): Promise<T | null> {
    return this.cache.get<T>(key);
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    return this.cache.set(key, value, ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    return this.cache.delete(key);
  }

  async clearPattern(pattern: string): Promise<void> {
    return this.cache.clearPattern(pattern);
  }

  hashParams(params: Record<string, unknown>): string {
    return this.cache.hashParams(params);
  }

  key(...parts: (string | number)[]): string {
    return this.cache.key(...parts);
  }

  async singleflight<T>(
    key: string,
    ttlSeconds: number,
    fetchFn: () => Promise<T>,
  ): Promise<T> {
    return this.cache.singleflight(key, ttlSeconds, fetchFn);
  }
}
