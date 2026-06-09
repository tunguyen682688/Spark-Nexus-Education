import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthUser } from '../decorators/current-user.decorator';

/**
 * AuthService
 *
 * Provides utility methods for authentication and user management
 */
@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  /**
   * Get Auth0 domain from configuration
   */
  getAuth0Domain(): string {
    return this.configService.get<string>('AUTH0_DOMAIN', '');
  }

  /**
   * Get Auth0 audience from configuration
   */
  getAuth0Audience(): string {
    return this.configService.get<string>('AUTH0_AUDIENCE', '');
  }

  /**
   * Extract user ID from Auth0 sub (removes provider prefix)
   *
   * Examples:
   * - "auth0|123456" -> "123456"
   * - "google-oauth2|123456" -> "123456"
   * - "github|123456" -> "123456"
   */
  extractUserId(auth0Sub: string): string {
    const parts = auth0Sub.split('|');
    return parts.length > 1 ? parts[1] : auth0Sub;
  }

  /**
   * Get provider from Auth0 sub
   *
   * Examples:
   * - "auth0|123456" -> "auth0"
   * - "google-oauth2|123456" -> "google-oauth2"
   */
  getProvider(auth0Sub: string): string {
    const parts = auth0Sub.split('|');
    return parts.length > 1 ? parts[0] : 'unknown';
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(user: AuthUser, permission: string): boolean {
    return user.permissions?.includes(permission) || false;
  }

  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(user: AuthUser, permissions: string[]): boolean {
    return permissions.every((permission) =>
      this.hasPermission(user, permission)
    );
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(user: AuthUser, permissions: string[]): boolean {
    return permissions.some((permission) =>
      this.hasPermission(user, permission)
    );
  }

  /**
   * Validate Auth0 configuration
   */
  validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.getAuth0Domain()) {
      errors.push('AUTH0_DOMAIN is not configured');
    }

    if (!this.getAuth0Audience()) {
      errors.push('AUTH0_AUDIENCE is not configured');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
