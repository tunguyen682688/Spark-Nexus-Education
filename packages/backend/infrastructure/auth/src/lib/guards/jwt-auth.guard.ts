import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JwtAuthGuard
 *
 * Protects routes by requiring valid Auth0 JWT token
 *
 * Usage:
 * ```typescript
 * @Controller('protected')
 * @UseGuards(JwtAuthGuard)
 * export class ProtectedController {
 *   @Get()
 *   getData(@CurrentUser() user: User) {
 *     return { message: `Hello ${user.email}` };
 *   }
 * }
 * ```
 *
 * To make specific routes public:
 * ```typescript
 * @Get('public')
 * @Public()
 * getPublicData() {
 *   return { message: 'This is public' };
 * }
 * ```
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  override canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Skip authentication for public routes
    }

    // Call passport's default JWT validation
    return super.canActivate(context);
  }

  override handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext
  ) {
    // Handle authentication errors
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      const token = authHeader?.replace(/^Bearer\s+/i, '');

      // Better error messages for debugging
      if (!authHeader) {
        throw new UnauthorizedException({
          statusCode: 401,
          message:
            'No authentication token provided. Please login and add token to Authorization header.',
          error: 'Unauthorized',
          details:
            'Authorization header is missing. Use format: Authorization: Bearer <token>',
        });
      }

      if (!token) {
        throw new UnauthorizedException({
          statusCode: 401,
          message:
            'Invalid token format. Token must be prefixed with "Bearer ".',
          error: 'Unauthorized',
          details: 'Expected format: Authorization: Bearer <token>',
        });
      }

      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Authentication token has expired. Please login again.',
          error: 'Unauthorized',
          details: `Token expired at: ${info.expiredAt}`,
        });
      }

      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Invalid authentication token. Please login again.',
          error: 'Unauthorized',
          details: info.message || 'Token validation failed',
        });
      }

      if (info?.name === 'TokenNotBeforeError') {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Token is not active yet.',
          error: 'Unauthorized',
          details: `Token will be valid after: ${info.date}`,
        });
      }

      throw new UnauthorizedException({
        statusCode: 401,
        message: err?.message || 'Authentication failed. Please login.',
        error: 'Unauthorized',
        details: info?.message || 'Unknown authentication error',
      });
    }

    return user;
  }
}
