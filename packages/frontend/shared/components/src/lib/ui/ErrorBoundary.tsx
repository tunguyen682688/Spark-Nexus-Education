import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { useEffect } from 'react';

export const ErrorBoundary = () => {
  const error = useRouteError();
  
  useEffect(() => {
    // Log error to monitoring service (Sentry, LogRocket, etc.)
    console.error('Route Error:', error);
  }, [error]);

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900">404</h1>
            <p className="text-xl text-gray-600 mt-4">Page not found</p>
            <Link to="/" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg">
              Go Home
            </Link>
          </div>
        </div>
      );
    }

    if (error.status === 401) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Unauthorized</h1>
            <p className="mt-4">Please log in to continue</p>
          </div>
        </div>
      );
    }

    if (error.status === 403) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Forbidden</h1>
            <p className="mt-4">You don't have permission to access this resource</p>
            <Link to="/" className="mt-6 inline-block text-blue-600">Back to Home</Link>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">Something went wrong</h1>
        <p className="mt-4 text-gray-600">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};
