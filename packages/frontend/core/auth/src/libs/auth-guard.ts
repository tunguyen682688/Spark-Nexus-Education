import { LoaderFunctionArgs } from 'react-router-dom';
import type { User } from '@auth0/auth0-spa-js';
import { getAuth0Client } from './auth0-client';
export interface AuthLoaderData {
  user: User | undefined;
  token: string;
}

export const authGuardLoader = async ({ request }: LoaderFunctionArgs): Promise<AuthLoaderData | null> => {
  const auth0 = getAuth0Client();
  const isAuthenticated = await auth0.isAuthenticated();

  if (!isAuthenticated) {
    // Lưu URL hiện tại để redirect về sau khi login
    const url = new URL(request.url);
    await auth0.loginWithRedirect({
      appState: { returnTo: url.pathname + url.search },
    });
    return null;
  }

  // Đã login, lấy thông tin user và token
  const user = await auth0.getUser();
  const token = await auth0.getTokenSilently();

  return { user, token };
};
