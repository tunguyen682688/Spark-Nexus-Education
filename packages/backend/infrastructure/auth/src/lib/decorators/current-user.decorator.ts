import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User interface extracted from Auth0 JWT
 */
export interface AuthUser {
  id: string; // Auth0 user ID (e.g., "auth0|123456")
  email?: string;
  name?: string;
  picture?: string;
  permissions?: string[];
  scope?: string;
  raw?: any; // Raw JWT payload
}

/**
 * @CurrentUser() Decorator
 *
 * Extracts authenticated user from request
 *
 * Usage:
 * ```typescript
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: AuthUser) {
 *   return {
 *     id: user.id,
 *     email: user.email,
 *     name: user.name,
 *   };
 * }
 * ```
 *
 * To get specific property:
 * ```typescript
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser('email') email: string) {
 *   return { email };
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUser;

    if (!user) {
      return null;
    }

    // Return specific property if requested
    return data ? user[data] : user;
  }
);
