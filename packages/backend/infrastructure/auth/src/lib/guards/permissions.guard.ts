import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthUser } from '../decorators/current-user.decorator';

/**
 * PermissionsGuard
 *
 * Validates that user has required Auth0 permissions (RBAC)
 *
 * Must be used after JwtAuthGuard to ensure user is authenticated
 *
 * Usage:
 * ```typescript
 * @Post('admin')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Permissions('write:admin')
 * adminAction() {
 *   return { message: 'Admin action' };
 * }
 * ```
 *
 * For global application:
 * ```typescript
 * import { APP_GUARD } from '@nestjs/core';
 *
 * @Module({
 *   providers: [
 *     {
 *       provide: APP_GUARD,
 *       useClass: JwtAuthGuard,
 *     },
 *     {
 *       provide: APP_GUARD,
 *       useClass: PermissionsGuard,
 *     },
 *   ],
 * })
 * ```
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required permissions from @Permissions() decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get authenticated user from request
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser;

    if (!user) {
      throw new ForbiddenException(
        'User not authenticated. Please login first.'
      );
    }

    // Check if user has all required permissions
    const userPermissions = user.permissions || [];
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(
        (permission) => !userPermissions.includes(permission)
      );

      throw new ForbiddenException(
        `Insufficient permissions. Missing: ${missingPermissions.join(', ')}`
      );
    }

    return true;
  }
}
