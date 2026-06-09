import { SetMetadata } from '@nestjs/common';

/**
 * Key used to store required permissions metadata
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * @Permissions() Decorator
 *
 * Requires specific Auth0 permissions for a route
 * Used with PermissionsGuard for Role-Based Access Control (RBAC)
 *
 * Setup in Auth0:
 * 1. Go to Auth0 Dashboard → APIs → Your API
 * 2. Navigate to Permissions tab
 * 3. Define permissions (e.g., 'read:users', 'write:posts')
 * 4. Assign permissions to users or roles
 *
 * Usage:
 * ```typescript
 * @Post('admin')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Permissions('write:admin', 'delete:users')
 * adminAction(@CurrentUser() user: AuthUser) {
 *   // Only users with both permissions can access
 *   return { message: 'Admin action executed' };
 * }
 * ```
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
