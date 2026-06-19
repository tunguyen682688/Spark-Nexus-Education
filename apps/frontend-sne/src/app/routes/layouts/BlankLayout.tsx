import { Outlet } from 'react-router-dom';

export const BlankLayout = () => {
  return (
    <div className="w-screen h-screen bg-transparent overflow-hidden">
      <Outlet />
    </div>
  );
};
