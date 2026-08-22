import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Siderbar';

const FULLSCREEN_ROUTES = [
  '/certification/exam-content-editor/',
  '/certification/session/',
];

export const MainLayout = () => {
  const location = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.some((route) => location.pathname.startsWith(route));

  if (isFullscreen) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden w-full min-w-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto w-full min-w-0">
          <div className="w-full min-w-0 p-2 sm:p-3 lg:p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
