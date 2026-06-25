import { useMyLibraryDashboard } from './use-my-library';

export function useHistoryContainer() {
  const { data: dashboardData, isLoading, isError } = useMyLibraryDashboard();

  return {
    dashboardData,
    isLoading,
    isError,
  };
}
