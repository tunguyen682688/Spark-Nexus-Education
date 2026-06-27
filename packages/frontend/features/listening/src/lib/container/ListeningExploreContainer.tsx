import { useListeningExplore } from '../hooks';
import ListeningCard from '../components/ListeningCard';
import ExploreFiltersSidebar from '../components/ExploreFiltersSidebar';
import ExploreCategoryTabs from '../components/ExploreCategoryTabs';
import {
  ArrowLeft,
  Library,
  Sparkles,
  Loader2,
  Headset,
  Video,
  Award,
  Music
} from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { LISTENING_ROUTES, LISTENING_EXPLORE_TEXT } from '../constants';

interface ListeningExploreContainerProps {
  fixedCategory?: string;
}

export default function ListeningExploreContainer({ fixedCategory }: ListeningExploreContainerProps) {
  const {
    category,
    difficulty,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortedMaterials,
    meta,
    isLoading,
    error,
    handleResetFilters,
    handleDifficultyChange,
    handleCategoryChange,
    handleApplyPreset,
    navigate,
    isFetchingNextPage,
    loadMoreRef,
  } = useListeningExplore({ fixedCategory });

  const text = LISTENING_EXPLORE_TEXT;

  // Compute Header details based on current category
  const getHeaderDetails = () => {
    switch (category) {
      case 'podcast':
        return {
          title: 'Podcasts & Audio Trò Chuyện 🎙️',
          subtitle: 'Luyện nghe hội thoại, bản tin Anh - Mỹ tự nhiên',
          Icon: Headset,
          iconClass: 'text-primary bg-primary/10 border-primary/20',
        };
      case 'video':
        return {
          title: 'Xem Video Luyện Nghe 📺',
          subtitle: 'Học nghe kèm hình ảnh phụ đề trực quan hỗ trợ phản xạ',
          Icon: Video,
          iconClass: 'text-red-400 bg-red-500/10 border-red-500/20',
        };
      case 'exam':
        return {
          title: 'Luyện Thi Chứng Chỉ (TOEIC / IELTS) 🏆',
          subtitle: 'Các bài luyện tập trắc nghiệm và chép chính tả mô phỏng đề thi',
          Icon: Award,
          iconClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        };
      case 'audio':
        return {
          title: 'Sách Nói (Audiobooks) 🎧',
          subtitle: 'Luyện nghe qua tệp âm thanh sách nói, truyện kể tiếng Anh bản xứ',
          Icon: Music,
          iconClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        };
      case 'news':
        return {
          title: 'Bản Tin Ngắn 📰',
          subtitle: 'Cập nhật tin tức thế giới và luyện nghe tiếng Anh thời sự',
          Icon: Library,
          iconClass: 'text-yellow-405 bg-yellow-500/10 border-yellow-500/20',
        };
      default:
        return {
          title: text.TITLE,
          subtitle: text.SUBTITLE,
          Icon: Sparkles,
          iconClass: 'text-primary bg-primary/10 border-primary/20',
        };
    }
  };

  const header = getHeaderDetails();
  const HeaderIcon = header.Icon;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Back navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Button
              onClick={() => navigate(LISTENING_ROUTES.HUB)}
              className="flex items-center gap-2 text-xs font-bold text-secondary-foreground hover:text-foreground transition-colors bg-secondary hover:bg-secondary/80 px-3.5 py-2 rounded-xl border border-border"
            >
              <ArrowLeft className="w-4 h-4" />
              {text.BACK_TO_HOME}
            </Button>
            <div className="flex items-center gap-3 mt-4">
              <div className={`p-3 rounded-2xl border ${header.iconClass}`}>
                <HeaderIcon className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
                  {header.title}
                </h1>
                <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                  {header.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar Filters & Sắp xếp */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* LEFT SIDEBAR: FILTERS */}
          <ExploreFiltersSidebar
            category={category}
            difficulty={difficulty}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            handleResetFilters={handleResetFilters}
            handleDifficultyChange={handleDifficultyChange}
            handleApplyPreset={handleApplyPreset}
          />

          {/* RIGHT CONTENT: GRID MATERIALS & CATEGORIES TABS */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Category tabs - Hide if we are on a dedicated category-locked page */}
            {!fixedCategory && (
              <ExploreCategoryTabs
                category={category}
                handleCategoryChange={handleCategoryChange}
              />
            )}

            {/* Info bar results counts */}
            <div className="flex items-center justify-between text-xs text-muted-foreground font-bold px-2">
              <span>{text.SHOWING_COUNT(sortedMaterials.length, meta.total)}</span>
              {difficulty !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full border border-primary/20 text-primary bg-primary/5 uppercase text-[9px] font-black">
                  {text.LEVEL_PREFIX}{difficulty}
                </span>
              )}
            </div>

            {/* Main Materials Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-40 text-muted-foreground gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs font-extrabold animate-pulse uppercase tracking-wider">{text.LOADING_DATA}</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-400 border border-red-500/10 bg-red-500/5 rounded-3xl font-bold text-xs">
                {text.ERROR_TITLE}
              </div>
            ) : sortedMaterials.length === 0 ? (
              <div className="text-center py-32 bg-muted/20 border border-border rounded-3xl text-muted-foreground space-y-4">
                <Library className="w-12 h-12 text-muted-foreground/60 mx-auto" />
                <p className="text-xs font-bold">{text.EMPTY_TITLE}</p>
                <Button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border text-foreground hover:text-foreground text-xs font-extrabold rounded-xl transition-all"
                >
                  {text.RESET_FILTERS_CTA}
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Cards Grid */}
                <div className={
                  category === 'podcast'
                    ? "flex flex-col gap-4"
                    : category === 'audio'
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                }>
                  {sortedMaterials.map((material) => (
                    <ListeningCard
                      key={material.id}
                      material={material}
                      onClick={(id) => navigate(LISTENING_ROUTES.STUDY(id))}
                      onDictationClick={(id) => navigate(LISTENING_ROUTES.WORKSPACE.DICTATION(id))}
                    />
                  ))}
                </div>

                {/* Infinite Scroll Trigger */}
                <div ref={loadMoreRef} className="h-4 w-full" />

                {/* Fetching Next Page Loader */}
                {isFetchingNextPage && (
                  <div className="flex justify-center items-center py-6">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
