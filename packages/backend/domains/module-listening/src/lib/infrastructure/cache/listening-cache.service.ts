import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class ListeningCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ListeningCacheService.name);
  private redis: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.initializeRedis();
  }

  onModuleDestroy() {
    if (this.redis) {
      this.redis.disconnect();
    }
  }

  private initializeRedis(): void {
    try {
      const redisHost = this.configService.get<string>('REDIS_HOST');
      const redisPort = parseInt(this.configService.get<string>('REDIS_PORT') ?? '6379', 10);
      const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

      if (redisHost && redisHost.trim() !== '') {
        this.redis = new Redis({
          host: redisHost,
          port: redisPort,
          ...(redisPassword && redisPassword.trim() !== '' ? { password: redisPassword } : {}),
          maxRetriesPerRequest: 1,
          connectTimeout: 2000, // 2s timeout
        });

        this.redis.on('error', (err) => {
          this.logger.warn(`Redis connection error, cache disabled: ${err.message}`);
        });

        this.logger.log('🚀 Redis cache initialized successfully for Listening Module');
      } else {
        this.logger.warn('Redis is not configured. Cache disabled.');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to initialize Redis cache: ${msg}`);
      this.redis = null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    try {
      const val = await this.redis.get(key);
      return val ? JSON.parse(val) : null;
    } catch (err) {
      this.logger.warn(`Failed to get cache key ${key}: ${(err as Error).message}`);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      this.logger.warn(`Failed to set cache key ${key}: ${(err as Error).message}`);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.del(key);
    } catch (err) {
      this.logger.warn(`Failed to delete cache key ${key}: ${(err as Error).message}`);
    }
  }

  async clearPattern(pattern: string): Promise<void> {
    if (!this.redis) return;
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (err) {
      this.logger.warn(`Failed to clear cache pattern ${pattern}: ${(err as Error).message}`);
    }
  }
}
