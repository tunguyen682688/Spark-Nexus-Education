import { useAuth } from '@spark-nest-ed/frontend-core-auth';
import { useMyCreatedSets } from '@spark-nest-ed/feature-vocabulary';
import { DashboardHome } from './components';

/**
 * DashboardPage — Route: /dashboard (protected, inside MainLayout)
 *
 * This acts as the Container component. It manages:
 * - Data fetching (user authentication details via useAuth)
 * - Vocabulary sets data fetching (via useMyCreatedSets)
 *
 * It passes all processed states and data down to the pure presentational DashboardHome UI component.
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const { data: mySetsData, isLoading: isLoadingSets } = useMyCreatedSets({ pageSize: 6 });
  const mySets = mySetsData?.data ?? [];

  return (
    <DashboardHome
      user={
        user as {
          name?: string;
          firstName?: string;
          username?: string;
          email?: string;
        } | null
      }
      mySets={mySets.map((s) => ({
        id: s.id,
        title: s.title,
        entryCount: s.entryCount,
        studyCount: s.studyCount,
      }))}
      isLoadingSets={isLoadingSets}
      streak={7}          // TODO: connect to real streak API
      dailyProgress={0}   // TODO: connect to real SRS due count API
      dailyGoal={20}
    />
  );
}