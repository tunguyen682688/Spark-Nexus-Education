import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import Redis from 'ioredis';
import axios from 'axios';
import { Request } from 'express';

/**
 * JwtStrategy
 *
 * Validates JWT tokens issued by Auth0 using JWKS (JSON Web Key Set)
 * and automatically synchronizes user profiles to the local Postgres database.
 *
 * Designed with a strict validation, automatic error-correction, and fault-tolerant
 * fallback mechanism for newly registered or first-time logging users.
 * Performance is optimized using a Redis cache.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  private redis: Redis | null = null;
  private readonly auth0Domain: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    const domain = configService.get<string>('AUTH0_DOMAIN');
    const audience = configService.get<string>('AUTH0_AUDIENCE');

    if (!domain || !audience) {
      throw new Error(
        'AUTH0_DOMAIN and AUTH0_AUDIENCE must be defined in environment variables'
      );
    }

    super({
      // Extract JWT from Authorization header as Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Pass the Request object to the validate callback so we can extract the raw token if needed
      passReqToCallback: true,

      // Use Auth0's JWKS endpoint to dynamically fetch public keys
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`,
      }),

      // Validate issuer (must match Auth0 domain)
      issuer: `https://${domain}/`,

      // Validate audience (must match API identifier)
      audience: audience,

      // Only accept RS256 algorithm (Auth0 default)
      algorithms: ['RS256'],
    });

    this.auth0Domain = domain;

    // Initialize Redis connection for cache-aside synchronization strategy
    this.initializeRedis();
  }

  /**
   * Safe initialization of Redis connection
   */
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
          this.logger.warn(`Redis connection error, falling back to database: ${err.message}`);
        });

        this.logger.log('🚀 Redis cache initialized successfully for Auth0 Sync');
      } else {
        this.logger.warn('Redis is not configured. Sync caching will be disabled (fallback to DB).');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to initialize Redis cache, falling back to database: ${msg}`);
      this.redis = null;
    }
  }

  /**
   * Simple email validation helper
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates the JWT payload and synchronizes the user profile to local database.
   *
   * @param req - Raw express request
   * @param payload - Decoded JWT payload from Auth0
   */
  async validate(req: Request, payload: Record<string, unknown>) {
    const sub = payload.sub as string | undefined;
    if (!sub) {
      throw new UnauthorizedException('Invalid token: missing subject');
    }

    // Try synchronizing user profile (fault-tolerant & optimized with Redis cache)
    const rawPayload = (payload.raw || {}) as Record<string, unknown>;
    const email = (payload.email || rawPayload.email) as string | undefined;
    const name = (payload.name || rawPayload.name) as string | undefined;
    const picture = (payload.picture || rawPayload.picture) as string | undefined;

    try {
      await this.syncUser(req, sub, { email, name, picture });
    } catch (syncError) {
      const msg = syncError instanceof Error ? syncError.message : 'Unknown error';
      this.logger.error(`[Auth Sync Fault] Failed to sync user ${sub} to DB: ${msg}`);
      // Fail-soft: we do not crash the auth request even if sync fails, ensuring high availability
    }

    // Return user object attached to request.user
    return {
      id: sub, // Auth0 User ID (e.g. auth0|123456)
      email: email,
      name: name,
      picture: picture,
      permissions: (payload.permissions as string[]) || [],
      scope: payload.scope as string | undefined,
      raw: payload,
    };
  }

  /**
   * Synchronize user to database with strict verification and cache optimization
   */
  private async syncUser(
    req: Request,
    userId: string,
    initialProfile: { email?: string; name?: string; picture?: string }
  ): Promise<void> {
    const cacheKey = `user:synced:${userId}`;

    // 1. Check Redis Cache (only bypass if cached state is true)
    if (this.redis) {
      try {
        const isSynced = await this.redis.get(cacheKey);
        if (isSynced === 'true') {
          // Cache hit: User was already synced within 24h. No DB write / API calls needed.
          return;
        }
      } catch {
        // Fallback silently to DB check if Redis fails
      }
    }

    // 2. Database Lookup
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Detect if current DB entry has temporary/corrupted data
    const isTempEmailInDb = existingUser?.email ? existingUser.email.includes('@no-email.temp') : false;
    const isMissingCriticalInfo = !existingUser || !existingUser.email || isTempEmailInDb;

    let email = initialProfile.email;
    let name = initialProfile.name;
    let picture = initialProfile.picture;

    // 3. Fallback to Auth0 /userinfo API if database has missing/temporary information
    if (isMissingCriticalInfo || !email) {
      const authorizationHeader = req.headers.authorization;
      if (authorizationHeader) {
        try {
          this.logger.debug(`[First-Time Login/Recovery] Fetching user profile from Auth0 /userinfo for ${userId}`);
          const response = await axios.get(`https://${this.auth0Domain}/userinfo`, {
            headers: { Authorization: authorizationHeader },
            timeout: 3000, // 3s timeout
          });

          if (response.data) {
            email = (response.data as Record<string, unknown>).email as string | undefined || email;
            name = (response.data as Record<string, unknown>).name as string | undefined || name;
            picture = (response.data as Record<string, unknown>).picture as string | undefined || picture;
          }
        } catch (auth0ApiError) {
          const errMsg = auth0ApiError instanceof Error ? auth0ApiError.message : 'Unknown error';
          this.logger.warn(`Could not fetch full profile from Auth0 /userinfo: ${errMsg}`);
          // Continue with whatever info we have in the token payload
        }
      }
    }

    // 4. Strict Validation & Normalization
    let finalEmail = email || existingUser?.email;
    if (!finalEmail || !this.isValidEmail(finalEmail)) {
      // Create a valid temporary email to satisfy Prisma DB constraints and avoid system crash
      finalEmail = `${userId.replace(/[^a-zA-Z0-9]/g, '_')}@no-email.temp`;
    }

    // Truncate name if too long (max 100 characters) to avoid database insertion errors
    let finalName = name || existingUser?.name || null;
    if (finalName && finalName.length > 100) {
      finalName = finalName.substring(0, 97) + '...';
    }

    // Standardize avatar URL
    let finalPicture = picture || existingUser?.picture || null;
    if (finalPicture && !finalPicture.startsWith('http://') && !finalPicture.startsWith('https://')) {
      finalPicture = null;
    }

    // 5. Database Write (Upsert)
    await this.prisma.user.upsert({
      where: { id: userId },
      update: {
        email: finalEmail,
        name: finalName,
        picture: finalPicture,
      },
      create: {
        id: userId,
        email: finalEmail,
        name: finalName,
        picture: finalPicture,
        role: 'user',
      },
    });

    this.logger.log(`👤 Verified and synchronized user profile in DB: ${userId} (${finalEmail})`);

    // 6. Save synced state in Redis (TTL = 1 day)
    // Only cache if we successfully synchronized a REAL email (not temporary fallback)
    if (this.redis && !finalEmail.includes('@no-email.temp')) {
      try {
        await this.redis.set(cacheKey, 'true', 'EX', 86400);
      } catch {
        // Fallback silently if Redis write fails
      }
    }
  }
}
