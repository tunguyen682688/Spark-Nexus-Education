import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Siderbar';

export const MainLayout = () => {
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
