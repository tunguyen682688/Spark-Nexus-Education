import React, { useState } from 'react';
import {
  useMyLibraryDashboard,
  useMyCreatedArticles,
  useDeleteMyArticle,
} from '../hooks/use-my-library';
import {
  Button,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  useToast,
} from '@spark-nest-ed/frontend-shared-components';
import {
  LibraryStatsGroup,
  InProgressCard,
  CollectionFolderCard,
  HistoryListItem,
  LibraryDarkStreakCard,
  DailyGoalRingCard,
  TopGenresStatsCard,
  LibraryPromoBanner,
} from '../components/dashboard/ReaderDashboardComponents';
import { MyArticleCard } from '../components/shared/MyArticleCard';
import { MoreHorizontal, FolderOpen, History, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { READING_UI_TEXT } from '../constants/reading-ui-text';

export const MyLibraryContainer: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: dashboardData, isLoading: isDashboardLoading } =
    useMyLibraryDashboard();
  const { data: createdArticles, isLoading: isCreatedLoading } =
    useMyCreatedArticles();
  const deleteMutation = useDeleteMyArticle();

  const [activeTab, setActiveTab] = useState<'reading' | 'created'>('reading');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteCreated = async (id: string) => {
    const isConfirm = window.confirm(READING_UI_TEXT.library.CONFIRM_DELETE);
    if (!isConfirm) return;

    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: READING_UI_TEXT.library.TOAST_SUCCESS,
        description: READING_UI_TEXT.library.TOAST_DELETE_SUCCESS,
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to delete article', error);
      toast({
        title: READING_UI_TEXT.library.TOAST_ERROR,
        description: READING_UI_TEXT.library.TOAST_DELETE_ERROR,
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const isLoading = isDashboardLoading;

  if (isLoading || !dashboardData) {
    return (
      <div className="max-w-full mx-auto p-4 md:p-8 min-h-screen font-sans bg-background">
        <Skeleton className="h-10 w-64 mb-8 dark:bg-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <Skeleton className="h-24 w-full rounded-2xl dark:bg-slate-800" />
            <Skeleton className="h-64 w-full rounded-2xl dark:bg-slate-800" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-40 w-full rounded-2xl dark:bg-slate-800" />
            <Skeleton className="h-48 w-full rounded-2xl dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-4 md:p-8 min-h-screen font-sans bg-background">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-[28px] font-black text-slate-800 dark:text-slate-100 tracking-tight">
          {READING_UI_TEXT.library.TITLE}
        </h1>
      </div>

      {/* Tabs list */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'reading' | 'created')}
        className="w-full mb-8"
      >
        <TabsList className="flex gap-2 border-b border-slate-200 dark:border-slate-800 bg-transparent p-0 rounded-none h-auto w-auto">
          <TabsTrigger
            value="reading"
            className="text-sm font-bold pb-2.5 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 bg-transparent dark:data-[state=active]:bg-transparent transition-all"
          >
            {READING_UI_TEXT.library.TAB_READING}
          </TabsTrigger>
          <TabsTrigger
            value="created"
            className="text-sm font-bold pb-2.5 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 bg-transparent dark:data-[state=active]:bg-transparent transition-all"
          >
            {READING_UI_TEXT.library.TAB_CREATED}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'reading' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
          {/* --- LEFT COLUMN: MAIN CONTENT --- */}
          <div className="lg:col-span-8 space-y-10">
            {/* Top Stats */}
            <LibraryStatsGroup stats={dashboardData.stats} />

            {/* In Progress */}
            <section className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <MoreHorizontal className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">
                    {READING_UI_TEXT.library.IN_PROGRESS}
                  </h3>
                </div>
                <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  {READING_UI_TEXT.library.VIEW_ALL}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dashboardData.inProgress.map((item) => (
                  <InProgressCard key={item.id} item={item} />
                ))}
              </div>
            </section>

            {/* Collections */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <div className="text-blue-600">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">
                  {READING_UI_TEXT.library.COLLECTIONS}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {dashboardData.collections.map((col) => (
                  <CollectionFolderCard key={col.id} collection={col} />
                ))}
              </div>
            </section>

            {/* History */}
            <section className="space-y-4 pb-10">
              <div className="flex items-center gap-2 px-1">
                <div className="text-blue-600">
                  <History className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">
                  {READING_UI_TEXT.library.HISTORY}
                </h3>
              </div>
              <div className="space-y-3">
                {dashboardData.history.map((item) => (
                  <HistoryListItem key={item.id} item={item} />
                ))}
              </div>
            </section>
          </div>

          {/* --- RIGHT COLUMN: SIDEBAR --- */}
          <div className="lg:col-span-4 space-y-6">
            <LibraryDarkStreakCard 
              streak={dashboardData.sidebar.streak} 
              weeklyActivity={dashboardData.sidebar.weeklyActivity} 
            />
            <DailyGoalRingCard goal={dashboardData.sidebar.dailyGoal} />
            <TopGenresStatsCard genres={dashboardData.sidebar.topGenres} />
            <LibraryPromoBanner />
          </div>
        </div>
      ) : (
        <div className="space-y-6 pb-12">
          {/* Header Action Card */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 gap-4 shadow-sm">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">
                {READING_UI_TEXT.library.YOUR_WORKS}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                {READING_UI_TEXT.library.YOUR_WORKS_SUB}
              </p>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-4 rounded-lg flex items-center gap-2 border-none shadow-sm transition-all"
              onClick={() => navigate(ROUTES.READING.STUDIO)}
            >
              <PlusCircle className="h-4 w-4" />{' '}
              {READING_UI_TEXT.library.WRITE_NEW}
            </Button>
          </div>

          {isCreatedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {[1, 2, 3].map((n) => (
                <Skeleton
                  key={n}
                  className="h-72 w-full rounded-2xl dark:bg-slate-800"
                />
              ))}
            </div>
          ) : createdArticles && createdArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {createdArticles.map((article) => (
                <MyArticleCard
                  key={article.id}
                  article={article}
                  onDelete={handleDeleteCreated}
                  isDeleting={deletingId === article.id}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                <PlusCircle className="h-10 w-10" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-100">
                  {READING_UI_TEXT.library.NO_WORKS}
                </h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  {READING_UI_TEXT.library.NO_WORKS_SUB}
                </p>
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg border-none"
                onClick={() => navigate(ROUTES.READING.STUDIO)}
              >
                {READING_UI_TEXT.library.CREATE_FIRST}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
