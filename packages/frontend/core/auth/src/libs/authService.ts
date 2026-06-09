import { secureStorage } from './secureStorage';
import { jwtDecode } from 'jwt-decode';

// Constants
const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';
const TOKEN_REFRESH_BUFFER = 5 * 60; // 5 minutes in seconds
const TOKEN_CLAIMS_KEY = 'auth_token_claims';

// Types
interface TokenClaims {
  sub: string;
  exp: number;
  iat: number;
  iss: string;
  aud: string;
  [key: string]: any;
}

// Cache cho token để tránh truy cập localStorage liên tục
let tokenCache: string | null = null;
let tokenExpiryCache: number | null = null;
let tokenClaimsCache: TokenClaims | null = null;

/**
 * Auth service - Quản lý token xác thực
 * Cung cấp các phương thức để làm việc với token JWT
 */
export const authService = {
  /**
   * Debug method to output token status
   */
  debugTokenStatus(): void {
    try {
      const hasToken = this.hasToken();
      const token = this.getToken();
      const isExpired = this.isTokenExpired();
      const needsRefresh = this.needsRefresh();
      
      console.log('=== Auth Token Debug ===');
      console.log('Has token:', hasToken);
      console.log('Token valid:', !!token);
      console.log('Token expired:', isExpired);
      console.log('Token needs refresh:', needsRefresh);
      
      if (token) {
        try {
          const claims = this.decodeToken(token);
          console.log('Token issuer:', claims.iss);
          console.log('Token audience:', claims.aud);
          console.log('Token subject:', claims.sub);
          console.log('Token issued at:', new Date(claims.iat * 1000).toISOString());
          console.log('Token expires at:', new Date(claims.exp * 1000).toISOString());
          const now = Math.floor(Date.now() / 1000);
          console.log('Current time:', new Date(now * 1000).toISOString());
          console.log('Seconds until expiry:', claims.exp - now);
        } catch (error) {
          console.error('Failed to decode token:', error);
        }
      }
      console.log('========================');
    } catch (error) {
      console.error('Error in debug token status:', error);
    }
  },
  
  /**
   * Lấy token đã lưu trữ nếu nó còn hợp lệ
   * @returns Token JWT hoặc null nếu không có hoặc đã hết hạn
   */
  getToken(): string | null {
    // Sử dụng cache nếu có
    if (tokenCache && tokenExpiryCache) {
      const now = Math.floor(Date.now() / 1000);
      if (tokenExpiryCache > now) {
        return tokenCache;
      }
      // Token đã hết hạn, xóa cache
      this.clearCache();
    }
    
    try {
      const cachedToken = secureStorage.getItem(TOKEN_KEY);
      const tokenExpiry = secureStorage.getItem(TOKEN_EXPIRY_KEY);
      
      if (!cachedToken || !tokenExpiry) {
        return null;
      }
      
      const now = Math.floor(Date.now() / 1000);
      const expiryTime = parseInt(tokenExpiry);
      const isTokenValid = expiryTime > now;
      
      // Cập nhật cache nếu token hợp lệ
      if (isTokenValid) {
        tokenCache = cachedToken;
        tokenExpiryCache = expiryTime;
        return cachedToken;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting token from storage:', error);
      return null;
    }
  },
  
  /**
   * Lưu trữ token với thời gian hết hạn
   * @param token - Token JWT cần lưu trữ
   * @param expiryTime - Thời gian hết hạn (Unix timestamp)
   */
  setToken(token: string, expiryTime?: number): void {
    try {
      // Lưu token vào storage
      secureStorage.setItem(TOKEN_KEY, token);
      
      // Xử lý thời gian hết hạn
      let expiry = expiryTime;
      
      // Nếu không cung cấp thời gian hết hạn, giải mã từ token
      if (!expiry) {
        try {
          const claims = this.decodeToken(token);
          if (claims && claims.exp) {
            expiry = claims.exp;
          }
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
        }
      }
      
      // Lưu thời gian hết hạn nếu có
      if (expiry) {
        secureStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
        
        // Cập nhật cache
        tokenCache = token;
        tokenExpiryCache = expiry;
      }
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },
  
  /**
   * Xóa token đã lưu trữ
   */
  clearToken(): void {
    secureStorage.removeItem(TOKEN_KEY);
    secureStorage.removeItem(TOKEN_EXPIRY_KEY);
    secureStorage.removeItem(TOKEN_CLAIMS_KEY);
    this.clearCache();
  },
  
  /**
   * Xóa cache trong bộ nhớ
   */
  clearCache(): void {
    tokenCache = null;
    tokenExpiryCache = null;
    tokenClaimsCache = null;
  },
  
  /**
   * Kiểm tra xem token có cần làm mới không
   * @returns true nếu token cần làm mới, ngược lại là false
   */
  needsRefresh(): boolean {
    try {
      // Sử dụng cache nếu có
      if (tokenExpiryCache) {
        const now = Math.floor(Date.now() / 1000);
        return tokenExpiryCache < (now + TOKEN_REFRESH_BUFFER);
      }
      
      const tokenExpiry = secureStorage.getItem(TOKEN_EXPIRY_KEY);
      
      if (!tokenExpiry) {
        return true;
      }
      
      const now = Math.floor(Date.now() / 1000);
      const expiryTime = parseInt(tokenExpiry);
      
      // Cập nhật cache
      tokenExpiryCache = expiryTime;
      
      return expiryTime < (now + TOKEN_REFRESH_BUFFER);
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  },

  /**
   * Kiểm tra xem token có tồn tại trong storage không
   * @returns true nếu token tồn tại, ngược lại là false
   */
  hasToken(): boolean {
    // Kiểm tra cache trước
    if (tokenCache) {
      return true;
    }
    
    try {
      const token = secureStorage.getItem(TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error('Error checking token existence:', error);
      return false;
    }
  },

  /**
   * Kiểm tra xem token đã lưu trữ có hết hạn không
   * @returns true nếu token đã hết hạn, ngược lại là false
   */
  isTokenExpired(): boolean {
    // Kiểm tra cache trước
    if (tokenExpiryCache !== null) {
      const now = Math.floor(Date.now() / 1000);
      return tokenExpiryCache <= now;
    }
    
    try {
      const tokenExpiry = secureStorage.getItem(TOKEN_EXPIRY_KEY);
      
      if (!tokenExpiry) {
        return true;
      }
      
      const now = Math.floor(Date.now() / 1000);
      const expiryTime = parseInt(tokenExpiry);
      
      // Cập nhật cache
      tokenExpiryCache = expiryTime;
      
      return expiryTime <= now;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  },
  
  /**
   * Giải mã token JWT để lấy thông tin claims
   * @param token - Token JWT cần giải mã
   * @returns Đối tượng chứa các claims từ token
   */
  decodeToken(token: string): TokenClaims {
    try {
      return jwtDecode<TokenClaims>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      throw error;
    }
  },
  
  /**
   * Lấy claims từ token hiện tại
   * @returns Đối tượng chứa các claims hoặc null nếu không có token hợp lệ
   */
  getTokenClaims(): TokenClaims | null {
    // Sử dụng cache nếu có
    if (tokenClaimsCache) {
      // Kiểm tra xem cache có còn hợp lệ không
      if (tokenExpiryCache) {
        const now = Math.floor(Date.now() / 1000);
        // Nếu token chưa hết hạn, trả về cache
        if (tokenExpiryCache > now) {
          return tokenClaimsCache;
        }
      }
    }
    
    const token = this.getToken();
    if (!token) {
      return null;
    }
    
    try {
      const claims = this.decodeToken(token);
      
      // Kiểm tra xem token có hợp lệ không
      if (claims && claims.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (claims.exp <= now) {
          // Token đã hết hạn, xóa cache
          this.clearCache();
          return null;
        }
      }
      
      // Cập nhật cache
      tokenClaimsCache = claims;
      if (claims.exp) {
        tokenExpiryCache = claims.exp;
      }
      
      return claims;
    } catch (error) {
      console.error('Error decoding token claims:', error);
      return null;
    }
  },
  
  /**
   * Lấy thời gian còn lại (tính bằng giây) trước khi token hết hạn
   * @returns Số giây còn lại hoặc 0 nếu token đã hết hạn
   */
  getTokenRemainingTime(): number {
    const claims = this.getTokenClaims();
    if (!claims || !claims.exp) {
      return 0;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const remainingTime = claims.exp - now;
    
    return Math.max(0, remainingTime);
  }
}; 