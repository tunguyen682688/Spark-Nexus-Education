import { Outlet, ScrollRestoration } from 'react-router-dom';
import { GlobalLoader } from '@spark-nest-ed/frontend-shared-components';

export const RootLayout = () => {
  return (
    <>
      <GlobalLoader />
      <Outlet />
      <ScrollRestoration />
    </>
  );
};
