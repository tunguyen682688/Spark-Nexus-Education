import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Event Types
 */
interface QueryEvent {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
}

interface LogEvent {
  timestamp: Date;
  message: string;
  target: string;
}

/**
 * PrismaService
 * Extends PrismaClient with NestJS lifecycle hooks and logging
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'pretty',
    });

    this.setupEventListeners();
  }

  /**
   * Setup event listeners for logging
   */
  private setupEventListeners(): void {
    // Query logging (development only)
    this.$on('query' as never, (event: QueryEvent) => {
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug(`Query: ${event.query}`);
        this.logger.debug(`Params: ${event.params}`);
        this.logger.debug(`Duration: ${event.duration}ms`);
      }
    });

    // Error logging
    this.$on('error' as never, (event: LogEvent) => {
      this.logger.error(`Database error: ${event.message}`);
    });

    // Warning logging
    this.$on('warn' as never, (event: LogEvent) => {
      this.logger.warn(`Database warning: ${event.message}`);
    });

    // Info logging
    this.$on('info' as never, (event: LogEvent) => {
      if (process.env.NODE_ENV === 'development') {
        this.logger.log(`Database info: ${event.message}`);
      }
    });
  }

  /**
   * Connect to database on module init
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('✅ Database connected successfully');
  }

  /**
   * Disconnect from database on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('🔌 Database disconnected');
  }

  /**
   * Clean database (useful for testing)
   * WARNING: This will delete all data!
   */
  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production!');
    }

    const tablenames = await this.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname='public'
    `;

    const tables = tablenames
      .map(({ tablename }: { tablename: string }) => tablename)
      .filter((name: string) => name !== '_prisma_migrations')
      .map((name: unknown) => `"public"."${name}"`)
      .join(', ');

    if (!tables) {
      this.logger.warn('No tables to clean');
      return;
    }

    try {
      await this.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
      this.logger.log('🧹 Database cleaned successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to clean database: ${message}`);
      throw error;
    }
  }

  /**
   * Health check - verify database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{
    tableCount: number;
    databaseSize: string;
  }> {
    const [tableCountResult, sizeResult] = await Promise.all([
      this.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `,
      this.$queryRaw<Array<{ size: string }>>`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `,
    ]);

    return {
      tableCount: Number(tableCountResult[0]?.count ?? 0),
      databaseSize: sizeResult[0]?.size ?? 'Unknown',
    };
  }
}
