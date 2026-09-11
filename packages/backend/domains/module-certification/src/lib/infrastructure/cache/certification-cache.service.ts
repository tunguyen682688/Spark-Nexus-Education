import { Injectable } from '@nestjs/common';
import { SharedCacheService } from '@spark-nest-ed/infrastructure-cache';

@Injectable()
export class CertificationCacheService {
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
}
