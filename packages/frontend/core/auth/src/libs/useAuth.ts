import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { authService } from './authService';
import { useToast } from '@spark-nest-ed/frontend-shared-components';

// Constants
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

// Types
interface User {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  name?: string;
  picture?: string;
}

/**
 * Custom hook for authentication management
 * Handles Auth0 integration, token validation, and session management
 * Follows Auth0 best practices for token handling and refresh
 */
export const useAuth = () => {
  const { toast } = useToast();

  // Auth0 hook
  const {
    isAuthenticated: isAuth0Authenticated,
    isLoading: isAuth0Loading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
    getIdTokenClaims,
    user: auth0User,
    error: auth0Error,
  } = useAuth0();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Refs for token refresh and validation
  const validationRetriesRef = useRef(0);
  const isValidatingRef = useRef(false);
  const refreshTokenIntervalRef = useRef<number | null>(null);
  const sessionTimeoutRef = useRef<number | null>(null);

  // Check if we have a token in storage
  const hasStoredToken = authService.hasToken();

  // Skip validation if we're still loading Auth0 or if we don't have a token
  const skipValidation =
    isAuth0Loading || !hasStoredToken || isValidatingRef.current;

  // Used to initialize token refresh and timeout
  // const initRef = useRef(false);

  /**
   * Setup token refresh interval
   * Auth0 recommends proactively refreshing tokens before they expire
   */
  useEffect(() => {
    const setupTokenRefresh = () => {
      // Clear any existing interval
      if (refreshTokenIntervalRef.current) {
        window.clearInterval(refreshTokenIntervalRef.current);
      }

      // Only set up refresh if authenticated
      if (isAuthenticated) {
        refreshTokenIntervalRef.current = window.setInterval(async () => {
          try {
            // Check if token needs refresh
            if (authService.needsRefresh()) {
              console.log('Token refresh required');

              const token = await getAccessTokenSilently({
                detailedResponse: false,
                timeoutInSeconds: 60,
              });

              if (token) {
                console.log('Token refreshed successfully');
                authService.setToken(token);
              }
            }
          } catch (error) {
            console.error('Failed to refresh token:', error);
          }
        }, TOKEN_REFRESH_INTERVAL);
      }
    };

    setupTokenRefresh();

    // Cleanup on unmount
    return () => {
      if (refreshTokenIntervalRef.current) {
        window.clearInterval(refreshTokenIntervalRef.current);
      }
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  /**
   * Setup session timeout
   * Automatically log out user after session timeout
   */
  useEffect(() => {
    const setupSessionTimeout = () => {
      // Clear any existing timeout
      if (sessionTimeoutRef.current) {
        window.clearTimeout(sessionTimeoutRef.current);
      }

      // Only set up timeout if authenticated
      if (isAuthenticated) {
        // Get remaining time from token if possible
        const remainingTime = authService.getTokenRemainingTime();
        const timeoutDuration =
          remainingTime > 0
            ? remainingTime * 1000 // Convert seconds to milliseconds
            : SESSION_TIMEOUT;

        sessionTimeoutRef.current = window.setTimeout(() => {
          console.log('Session timeout reached, requiring re-authentication');

          // Clear token and force logout
          authService.clearToken();
          setIsAuthenticated(false);
          setSessionExpired(true);

          toast({
            title: 'Session Expired',
            description:
              'Your session has expired. Please sign in again to continue.',
            variant: 'destructive',
          });

          // Redirect to login
          loginWithRedirect({
            authorizationParams: {
              prompt: 'login',
            },
          });
        }, timeoutDuration);
      }
    };

    setupSessionTimeout();

    // Cleanup on unmount
    return () => {
      if (sessionTimeoutRef.current) {
        window.clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, [isAuthenticated, toast, loginWithRedirect]);

  // Thêm log để debug
  useEffect(() => {
    if (!skipValidation) {
      const token = authService.getToken();
      console.log(
        `Validating token: ${token ? 'Token exists' : 'No token found'}`
      );

      if (token) {
        try {
          // Log token details for debugging
          const claims = authService.getTokenClaims();
          console.log('Token claims:', {
            sub: claims?.sub,
            exp: claims?.exp
              ? new Date(claims.exp * 1000).toISOString()
              : 'unknown',
            iss: claims?.iss,
            aud: claims?.aud,
          });

          // Check if token is expired
          if (authService.isTokenExpired()) {
            console.warn('Token is expired according to local validation');
          }
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
    }
  }, [skipValidation]);

  /**
   * Get authentication token with refresh logic
   * Follows Auth0 best practices for token acquisition
   */
  const getToken = useCallback(async () => {
    try {
      // If we're not authenticated with Auth0, return null
      if (!isAuth0Authenticated) {
        return null;
      }

      // If validation has failed and we're retrying, force a new token
      if (validationRetriesRef.current > 0) {
        console.log(
          'Validation retry in progress, forcing new token acquisition'
        );
        // Clear existing token to force a fresh one
        authService.clearToken();

        // Get a new token from Auth0
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
          cacheMode: 'off', // Force a new token request
          detailedResponse: false, // Just get the token string
        });

        // Store the token
        if (token) {
          authService.setToken(token);
          return token;
        }

        return null;
      }

      // Check if we have a valid token in storage
      if (authService.hasToken() && !authService.isTokenExpired()) {
        return authService.getToken();
      }

      // Get a new token from Auth0
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
        detailedResponse: false, // Just get the token string
      });

      // Store the token
      if (token) {
        authService.setToken(token);
        return token;
      }

      return null;
    } catch (error) {
      console.error('Error getting token:', error);

      // Handle specific Auth0 errors
      if (error instanceof Error) {
        const errorMessage = error.message || '';

        // Handle token expired errors
        if (
          errorMessage.includes('expired') ||
          errorMessage.includes('expired_token') ||
          errorMessage.includes('invalid_token')
        ) {
          console.warn('Token expired or invalid, clearing local token');
          authService.clearToken();
          setSessionExpired(true);
        }
      }

      return null;
    }
  }, [isAuth0Authenticated, getAccessTokenSilently]);

  /**
   * Handle Auth0 authentication state
   */
  useEffect(() => {
    const handleAuth0State = async () => {
      // If Auth0 is still loading, wait
      if (isAuth0Loading) return;

      // If user is authenticated with Auth0
      if (isAuth0Authenticated && auth0User) {
        try {
          // Get token and store it
          const token = await getToken();

          if (token) {
            // Get user claims from ID token
            const idTokenClaims = await getIdTokenClaims();

            // Set user information from claims
            if (idTokenClaims) {
              setUser({
                id: idTokenClaims.sub,
                email: idTokenClaims.email || auth0User.email || '',
                roles: idTokenClaims.roles || [],
                permissions: idTokenClaims.permissions || [],
                name: auth0User.name || idTokenClaims.name || '',
                picture: auth0User.picture || idTokenClaims.picture || '',
              });
            }

            setIsAuthenticated(true);
            setSessionExpired(false);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.error('Error getting token:', error);
          setIsAuthenticated(false);
          setUser(null);
        }
      } else if (!isAuth0Loading) {
        // If Auth0 is done loading and user is not authenticated
        if (!hasStoredToken) {
          // No stored token, definitely not authenticated
          setIsAuthenticated(false);
          setUser(null);
        }
        // Otherwise, rely on token validation result
      }

      // Auth state is determined, no longer loading
      setIsLoading(false);
    };

    handleAuth0State();
  }, [
    isAuth0Loading,
    isAuth0Authenticated,
    auth0User,
    hasStoredToken,
    getIdTokenClaims,
    getToken,
  ]);

  /**
   * Handle Auth0 errors
   */
  useEffect(() => {
    if (auth0Error) {
      console.error('Auth0 error:', auth0Error);
      toast({
        title: 'Authentication Error',
        description:
          auth0Error.message || 'An error occurred during authentication.',
        variant: 'destructive',
      });
    }
  }, [auth0Error, toast]);

  /**
   * Logout from both Auth0 and local storage
   * Cleans up all auth state
   */
  const handleLogout = useCallback(() => {
    // Clear local token and state
    authService.clearToken();
    setIsAuthenticated(false);
    setUser(null);

    // Clear intervals and timeouts
    if (refreshTokenIntervalRef.current) {
      window.clearInterval(refreshTokenIntervalRef.current);
      refreshTokenIntervalRef.current = null;
    }

    if (sessionTimeoutRef.current) {
      window.clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }

    // Logout from Auth0
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }, [auth0Logout]);

  /**
   * Login with redirect to specified return URL
   */
  const handleLogin = useCallback(
    (returnTo?: string) => {
      const loginOptions = {
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          redirect_uri: window.location.origin,
        },
        appState: returnTo ? { returnTo } : undefined,
      };

      loginWithRedirect(loginOptions);
    },
    [loginWithRedirect]
  );

  return {
    isAuthenticated,
    isLoading,
    user,
    sessionExpired,
    login: handleLogin,
    logout: handleLogout,
    getToken,
    refreshToken: getToken, // Expose explicit refresh method
  };
};
