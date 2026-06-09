import { redirect } from 'react-router-dom';
import { getAuth0Client } from '@spark-nest-ed/frontend-core-auth';

export const callbackLoader = async () => {
  const auth0 = getAuth0Client();
  const result = await auth0.handleRedirectCallback();
  const targetUrl = result.appState?.returnTo || '/app';
  return redirect(targetUrl);
};

export const CallbackPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-2">Processing login...</h2>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
    </div>
  </div>
);
