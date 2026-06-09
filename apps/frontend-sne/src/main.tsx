/**
 * Main Entry Point
 * 
 * Setup order:
 * 1. Auth0 initialization
 * 2. Axios client with Auth0 token provider
 * 3. React Router
 * 4. React app render
 */

import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

// Auth
import {
  getAuth0Client,
  initializeAuth0,
  AuthProvider,
} from '@spark-nest-ed/frontend-core-auth';

// React Query
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// HTTP Client & Query Client
import {
  createAxiosClient,
  queryClient,
} from '@spark-nest-ed/frontend-core-api';

// UI Components
import {
  ToasterCustom,
  Sonner,
  TooltipProvider,
} from '@spark-nest-ed/frontend-shared-components';

// Router
import { createRouter } from './app/routes/router';

// Styles
import './styles.css';

// App
import App from './app/app';

/**
 * Token Provider cho Axios Client
 * Auth0 SDK tự động handle caching & refresh
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const auth0 = getAuth0Client();

    // Get token từ Auth0 (auto cache & refresh)
    const token = await auth0.getTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });

    return token || null;
  } catch (error) {
    console.error('[Auth] Failed to get token:', error);

    // Check authentication status
    try {
      const auth0 = getAuth0Client();
      const isAuthenticated = await auth0.isAuthenticated();

      if (!isAuthenticated) {
        // User chưa đăng nhập -> redirect to Auth0 login
        console.warn('[Auth] User not authenticated, redirecting to login...');
        await auth0.loginWithRedirect({
          appState: { returnTo: window.location.pathname },
        });
      }
    } catch (redirectError) {
      console.error('[Auth] Failed to redirect to login:', redirectError);
    }

    return null;
  }
}

/**
 * Initialize Application
 */
async function initApp(): Promise<void> {
  try {
    // 1. Initialize Auth0
    console.log('[App] Initializing Auth0...');
    await initializeAuth0();

    // 2. Setup Axios with Auth0 token provider
    console.log('[App] Setting up HTTP client...');
    createAxiosClient(getAuthToken);

    // 3. Create React Router
    console.log('[App] Creating router...');
    const router = createRouter();

    // 4. Render React App
    console.log('[App] Rendering app...');
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    const root = ReactDOM.createRoot(rootElement);

    root.render(
      <StrictMode>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <ToasterCustom.Toaster />
              <Sonner.Toaster />
              <App router={router} />
              <ReactQueryDevtools initialIsOpen={false} />
            </TooltipProvider>
          </QueryClientProvider>
        </AuthProvider>
      </StrictMode>
    );

    console.log('[App] ✅ Application initialized successfully');
  } catch (error) {
    console.error('[App] ❌ Failed to initialize application:', error);
    
    // Show error to user
    document.body.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: system-ui, -apple-system, sans-serif;
        background: #f5f5f5;
      ">
        <div style="
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          max-width: 500px;
        ">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">Failed to Initialize App</h1>
          <p style="color: #64748b; margin-bottom: 1.5rem;">
            ${error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              padding: 0.5rem 1.5rem;
              background: #3b82f6;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 1rem;
            "
          >
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
}

// Start application
initApp();
