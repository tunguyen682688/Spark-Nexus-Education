import { SetMetadata } from '@nestjs/common';

/**
 * Key used to mark routes as public
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() Decorator
 *
 * Marks a route as public, bypassing JWT authentication
 *
 * Usage:
 * ```typescript
 * @Controller('api')
 * @UseGuards(JwtAuthGuard) // Apply guard to entire controller
 * export class ApiController {
 *
 *   @Get('protected')
 *   getProtected(@CurrentUser() user: AuthUser) {
 *     return { message: 'This requires authentication' };
 *   }
 *
 *   @Get('public')
 *   @Public() // This route skips authentication
 *   getPublic() {
 *     return { message: 'This is public' };
 *   }
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
