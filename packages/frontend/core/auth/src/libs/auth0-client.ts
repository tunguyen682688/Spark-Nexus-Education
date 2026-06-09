import { Auth0Client } from '@auth0/auth0-spa-js';

let auth0Client: Auth0Client | null = null;

export const initializeAuth0 = async () => {
  if (auth0Client) {
    return auth0Client;
  }

  auth0Client = new Auth0Client({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    },
    cacheLocation: 'localstorage',
    useRefreshTokens: true, // Quan trọng: Bật refresh token
  });

  // Kiểm tra session hiện tại
    try {
      await auth0Client.checkSession();
    } catch (error) {
      console.log('No active session', error);
    }

  return auth0Client;
};

export const getAuth0Client = () => {
  if (!auth0Client) {
    throw new Error('Auth0 not initialized. Call initializeAuth0 first.');
  }
  return auth0Client;
};
