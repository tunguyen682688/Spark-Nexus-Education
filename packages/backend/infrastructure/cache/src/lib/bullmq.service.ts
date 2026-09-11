import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Queue, Job } from 'bullmq';

/**
 * Type for a job handler function.
 */
type JobHandler = (job: Job) => Promise<void>;

/**
 * Unified Redis + BullMQ service — 1 connection for everything.
 *
 * Connections per instance: 1 (was 8 before: 1 cache + 1 BullMQ command + 6 blocking workers)
 *
 * Key design decisions:
 * - Single ioredis connection for cache operations AND queue commands.
 * - NO BullMQ Workers (each Worker creates a blocking BRPOP connection).
 * - Instead, a single polling loop uses Queue.getNextJob({ block: false }) on each queue.
 * - ioredis handles command multiplexing internally (safe for concurrent use).
 * - Polling interval is configurable via REDIS_POLL_INTERVAL_MS (default 200ms).
 */
@Injectable()
export class BullMQService implements OnModuleDestroy {
  private readonly logger = new Logger(BullMQService.name);
  private connection: Redis | null = null;
  private readonly queues = new Map<string, Queue>();
  private readonly handlers = new Map<string, JobHandler>();
  private readonly enabled: boolean;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private processing = false;

  constructor(private readonly config: ConfigService) {
    this.enabled = this.config.get<string>('REDIS_ENABLED', 'true') === 'true';
  }

  /**
   * Get or create the SINGLE shared Redis connection.
   * Used for: cache ops, queue commands, job polling.
   */
  getConnection(): Redis | null {
    if (!this.enabled) return null;
    if (this.connection) return this.connection;

    const host = this.config.get<string>('REDIS_HOST');
    const port = parseInt(this.config.get<string>('REDIS_PORT') ?? '6379', 10);
    const password = this.config.get<string>('REDIS_PASSWORD');

    if (!host || host.trim() === '') {
      this.logger.warn('Redis not configured. Running without cache/queue.');
      return null;
    }

    this.connection = new Redis({
      host,
      port,
      ...(password && password.trim() !== '' ? { password } : {}),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      keepAlive: 30000,
      connectTimeout: 3000,
      commandTimeout: 5000,
      lazyConnect: true,
      enableAutoPipelining: true,
      retryStrategy(times: number) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });

    this.connection.on('error', (err) => {
      this.logger.warn(`Redis error: ${err.message}`);
    });

    this.connection.connect().catch(() => {
      this.logger.warn('Redis connection failed');
    });

    return this.connection;
  }

  /**
   * Get or create a queue (uses shared connection).
   */
  getQueue(name: string): Queue | null {
    if (this.queues.has(name)) return this.queues.get(name)!;

    const conn = this.getConnection();
    if (!conn) return null;

    const queue = new Queue(name, {
      connection: conn,
      defaultJobOptions: {
        removeOnComplete: { count: 50, age: 1800 },
        removeOnFail: { count: 20, age: 3600 },
      },
    });

    this.queues.set(name, queue);
    return queue;
  }

  /**
   * Add a job to a queue.
   */
  async add(
    queueName: string,
    jobName: string,
    data: Record<string, unknown> = {},
    opts?: { attempts?: number; backoff?: { type: string; delay: number }; delay?: number; removeOnComplete?: { count?: number; age?: number }; removeOnFail?: { count?: number; age?: number } },
  ): Promise<Job | null> {
    const queue = this.getQueue(queueName);
    if (!queue) {
      this.logger.warn(`Redis disabled. Running "${jobName}" synchronously.`);
      return null;
    }

    return queue.add(jobName, data, {
      attempts: opts?.attempts ?? 3,
      backoff: opts?.backoff ?? { type: 'exponential', delay: 2000 },
      removeOnComplete: opts?.removeOnComplete ?? { count: 50, age: 1800 },
      removeOnFail: opts?.removeOnFail ?? { count: 20, age: 3600 },
      ...opts,
    });
  }

  /**
   * Register a handler for a queue.
   * Uses polling (non-blocking) instead of BRPOP — saves 1 Redis connection per queue.
   */
  registerWorker(
    queueName: string,
    handler: (job: Job) => Promise<void>,
  ): void {
    this.handlers.set(queueName, handler);
    this.logger.log(`[${queueName}] Handler registered (polling mode)`);

    // Start polling if not already running
    if (!this.pollTimer) {
      this.startPolling();
    }
  }

  /**
   * Single polling loop that cycles all registered queues.
   * Uses Redis LPOP (non-blocking) instead of BRPOP — zero blocking connections.
   *
   * We manually move jobs to active and process them, mimicking Worker behavior
   * but without the blocking connection overhead.
   */
  private startPolling(): void {
    const intervalMs = parseInt(
      this.config.get<string>('REDIS_POLL_INTERVAL_MS') ?? '500',
      10,
    );

    this.pollTimer = setInterval(async () => {
      if (this.processing) return;
      this.processing = true;

      try {
        const conn = this.getConnection();
        if (!conn) return;

        for (const [queueName, handler] of this.handlers) {
          try {
            // LPOP from the wait list (non-blocking)
            const jobId = await conn.lpop(`bull:${queueName}:wait`);
            if (!jobId) continue;

            // Move to active set
            await conn.sadd(`bull:${queueName}:active`, jobId);

            // Fetch full job data
            const jobData = await conn.hgetall(`bull:${queueName}:${jobId}`);
            if (!jobData || Object.keys(jobData).length === 0) {
              // Job data missing — move to failed
              await conn.srem(`bull:${queueName}:active`, jobId);
              continue;
            }

            // Create a minimal Job-like object for the handler
            const job: Partial<Job> = {
              id: jobId,
              name: jobData.name,
              data: jobData.data ? JSON.parse(jobData.data) : {},
              opts: jobData.opts ? JSON.parse(jobData.opts) : {},
              queueName,
              progress: (p: unknown) => conn.hset(`bull:${queueName}:${jobId}`, 'progress', JSON.stringify(p)),
              updateProgress: async (p: unknown) => {
                await conn.hset(`bull:${queueName}:${jobId}`, 'progress', JSON.stringify(p));
              },
              updateData: async (d) => {
                await conn.hset(`bull:${queueName}:${jobId}`, 'data', JSON.stringify(d));
              },
            };

            this.logger.log(`[${queueName}] Processing job ${jobId} "${jobData.name}"`);

            try {
              await handler(job as Job);

              // Move to completed
              const timestamp = Date.now().toString();
              await conn.lpush(`bull:${queueName}:completed`, jobId);
              await conn.ltrim(`bull:${queueName}:completed`, 0, 49);
              await conn.srem(`bull:${queueName}:active`, jobId);
              await conn.hset(`bull:${queueName}:${jobId}`, 'finishedOn', timestamp);
              await conn.zadd(`bull:${queueName}:delayed`, Date.now() + 86400000, jobId); // for removeOnComplete cleanup

              this.logger.log(`[${queueName}] Job ${jobId} completed`);
            } catch (err) {
              // Move to failed
              const errorMsg = err instanceof Error ? err.message : String(err);
              await conn.lpush(`bull:${queueName}:failed`, jobId);
              await conn.srem(`bull:${queueName}:active`, jobId);
              await conn.hset(
                `bull:${queueName}:${jobId}`,
                'failedReason', errorMsg,
                'finishedOn', Date.now().toString(),
              );

              this.logger.error(`[${queueName}] Job ${jobId} failed: ${errorMsg}`);
            }
          } catch (err) {
            this.logger.error(`[${queueName}] Poll error: ${err instanceof Error ? err.message : err}`);
          }
        }
      } finally {
        this.processing = false;
      }
    }, intervalMs);

    this.logger.log(`Polling started (interval=${intervalMs}ms, queues=${this.handlers.size})`);
  }

  /**
   * Get active connection status.
   */
  isConnected(): boolean {
    return this.connection !== null && this.connection.status === 'ready';
  }

  async onModuleDestroy() {
    // Stop polling
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    // Close all queues
    for (const [name, queue] of this.queues) {
      try {
        await queue.close();
        this.logger.log(`[${name}] Queue closed`);
      } catch {
        // ignore
      }
    }

    // Close connection
    if (this.connection) {
      this.connection.disconnect();
      this.logger.log('Redis connection closed');
    }
  }
}
