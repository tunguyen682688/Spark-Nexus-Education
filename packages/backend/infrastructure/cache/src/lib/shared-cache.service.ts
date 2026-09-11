import { Injectable } from '@nestjs/common';
import { BullMQService } from './bullmq.service';
import * as crypto from 'crypto';
import { gzipSync, gunzipSync } from 'zlib';

const COMPRESS_THRESHOLD = 1024;
const NEGATIVE_CACHE_TTL = 30;
const NULL_MARKER = '__NULL__';

const inflight = new Map<string, Promise<unknown>>();

/**
 * Shared cache service — Redis is OPTIONAL.
 * If Redis is unavailable, all methods are no-ops (return null / do nothing).
 * The app works correctly without Redis, just without caching.
 */
@Injectable()
export class SharedCacheService {
  constructor(private readonly bullMQ: BullMQService) {}

  private get redis() {
    return this.bullMQ.getConnection();
  }

  hashParams(params: Record<string, unknown>): string {
    const sorted = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, unknown>);
    return crypto.createHash('sha256').update(JSON.stringify(sorted)).digest('hex').slice(0, 16);
  }

  key(...parts: (string | number)[]): string {
    return parts.join(':');
  }

  private compress(value: string): Buffer {
    return gzipSync(Buffer.from(value, 'utf-8'), { level: 6 });
  }

  private decompress(data: Buffer): string {
    return gunzipSync(data).toString('utf-8');
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    try {
      const val = await this.redis.getBuffer(key);
      if (!val) return null;

      let raw: string;
      if (val.length >= 2 && val[0] === 0x1f && val[1] === 0x8b) {
        raw = this.decompress(val);
      } else {
        raw = val.toString('utf-8');
      }

      if (raw === NULL_MARKER) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!this.redis) return;
    try {
      if (value === null || value === undefined) {
        await this.redis.set(key, NULL_MARKER, 'EX', ttlSeconds || NEGATIVE_CACHE_TTL);
        return;
      }

      const json = JSON.stringify(value);
      if (json.length > COMPRESS_THRESHOLD) {
        await this.redis.set(key, this.compress(json), 'EX', ttlSeconds);
      } else {
        await this.redis.set(key, json, 'EX', ttlSeconds);
      }
    } catch {
      // Silently fail — app continues without cache
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.del(key);
    } catch {
      // Silently fail
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    if (!this.redis || keys.length === 0) return;
    try {
      const pipeline = this.redis.pipeline();
      for (const key of keys) {
        pipeline.del(key);
      }
      await pipeline.exec();
    } catch {
      // Silently fail
    }
  }

  async clearPattern(pattern: string): Promise<void> {
    if (!this.redis) return;
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          const pipeline = this.redis.pipeline();
          for (const key of keys) {
            pipeline.del(key);
          }
          await pipeline.exec();
        }
      } while (cursor !== '0');
    } catch {
      // Silently fail
    }
  }

  /**
   * Singleflight: prevents cache stampede.
   * Falls through to fetchFn immediately if Redis is unavailable.
   */
  async singleflight<T>(
    key: string,
    ttlSeconds: number,
    fetchFn: () => Promise<T>,
  ): Promise<T> {
    // No Redis? Just run the fetch function directly.
    if (!this.redis) return fetchFn();

    try {
      const cached = await this.get<T>(key);
      if (cached !== null) return cached;
    } catch {
      // Cache read failed — proceed to fetch
    }

    const existing = inflight.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    const promise = fetchFn()
      .then(async (data) => {
        await this.set(key, data, ttlSeconds);
        return data;
      })
      .finally(() => {
        inflight.delete(key);
      });

    inflight.set(key, promise);
    return promise;
  }

  async getRedis() {
    return this.redis;
  }
}
