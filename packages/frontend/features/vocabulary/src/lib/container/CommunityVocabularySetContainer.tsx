import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2,
  BookOpen,
  Plus,
  Heart,
  Search,
  ChevronDown,
  Star,
  Award,
  Sparkles,
  Users,
  Library,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  useToast,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Input,
} from '@spark-nest-ed/frontend-shared-components';
import { CATEGORY_LIST, ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { useDebounceValue } from 'usehooks-ts';
import {
  useCommunityVocabularySets,
  useToggleFavorite,
} from '../hooks/use-vocabulary-sets';
import { useCreateEmptyVocabularySet } from '../hooks/use-create-empty-vocabulary-set';
import { Language, VocabularySetType } from '../types';
import type { CommunityVocabularySet } from '../types';
import type {
  ApiQueryParams,
  SortSpec,
} from '@spark-nest-ed/frontend-core-api';

// ─── Colour helpers (no magic-strings scattered in JSX) ──────────────────────
const RANK_COLOURS = [
  'bg-amber-400 text-white',
  'bg-slate-400 text-white',
  'bg-amber-700 text-white',
  'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
];

function levelInfo(entryCount: number) {
  if (entryCount > 40)
    return {
      label: 'C1 · ADVANCED',
      cls: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    };
  if (entryCount > 25)
    return {
      label: 'B2 · INTERMEDIATE',
      cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    };
  return {
    label: 'A2 · ELEMENTARY',
    cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  };
}

// Cover images cycle so we never repeat the same fallback for all cards
const FALLBACK_COVERS = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=60',
];

function coverFor(set: CommunityVocabularySet, idx: number) {
  return set.coverImage || FALLBACK_COVERS[idx % FALLBACK_COVERS.length];
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function CommunityVocabularySetContainer() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Filters / pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'featured' | 'recent' | 'popular'>(
    'featured'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [accumulatedSets, setAccumulatedSets] = useState<
    CommunityVocabularySet[]
  >([]);

  const [debouncedSearch] = useDebounceValue(searchTerm, 500);

  const toggleFavoriteMutation = useToggleFavorite();
  const createEmptySetMutation = useCreateEmptyVocabularySet();

  // Category slider scrolling hooks and handlers
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 1);
      setCanScrollRight(scrollWidth - scrollLeft - clientWidth > 1);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return () => { /* no-op */ };

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    
    // Re-run checking after images or fonts load
    const timer = setTimeout(checkScroll, 500);
    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkScroll, 100);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollTo({
        left: container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount),
        behavior: 'smooth',
      });
    }
  };

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, activeTab]);

  // Build query params
  const queryParams = useMemo<ApiQueryParams>(() => {
    const resolvedSort: SortSpec[] =
      activeTab === 'recent'
        ? [{ field: 'createdAt', direction: 'desc' }]
        : activeTab === 'popular'
        ? [
            { field: 'favoriteCount', direction: 'desc', priority: 1 },
            { field: 'entryCount', direction: 'desc', priority: 2 },
          ]
        : [{ field: 'createdAt', direction: 'desc' }];

    return {
      page: currentPage,
      pageSize: 9,
      sort: resolvedSort,
      search: debouncedSearch || undefined,
      searchFields: debouncedSearch ? ['title', 'description'] : undefined,
      filters: selectedCategory ? { tags: [selectedCategory] } : undefined,
    };
  }, [activeTab, currentPage, debouncedSearch, selectedCategory]);

  // Fetch
  const {
    data: setsData,
    isLoading,
    error,
  } = useCommunityVocabularySets(queryParams);

  // Accumulate for infinite-scroll pattern
  useEffect(() => {
    if (!setsData?.data) return;
    if (currentPage === 1) {
      setAccumulatedSets(setsData.data);
    } else {
      setAccumulatedSets((prev) => {
        const seen = new Set(prev.map((s) => s.id));
        return [...prev, ...setsData.data.filter((s) => !seen.has(s.id))];
      });
    }
  }, [setsData, currentPage]);

  // Toast on error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Lỗi tải học liệu cộng đồng',
        description: 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const paginationMeta = setsData?.meta;
  const hasMore = paginationMeta
    ? currentPage < paginationMeta.totalPages
    : false;

  // ── Derive real top-contributors from the data we already have ──────────────
  // No mock fallback — show skeleton / empty state if no data yet.
  const topContributors = useMemo(() => {
    const map = new Map<
      string,
      { name: string; initial: string; sets: number }
    >();
    accumulatedSets.forEach((set) => {
      const name = set.creator?.name?.trim() || '';
      if (!name) return;
      const entry = map.get(name);
      if (entry) {
        entry.sets += 1;
      } else {
        map.set(name, { name, initial: name.charAt(0).toUpperCase(), sets: 1 });
      }
    });
    return Array.from(map.values())
      .sort((a, b) => b.sets - a.sets)
      .slice(0, 5);
  }, [accumulatedSets]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleToggleFavorite = async (setId: string, isFavorited: boolean) => {
    try {
      await toggleFavoriteMutation.mutateAsync({
        setId,
        isFavorited: !isFavorited,
      });
      setAccumulatedSets((prev) =>
        prev.map((s) =>
          s.id === setId
            ? {
                ...s,
                isFavorited: !isFavorited,
                favoriteCount: s.favoriteCount + (!isFavorited ? 1 : -1),
              }
            : s
        )
      );
      toast({
        title: isFavorited ? 'Đã bỏ yêu thích' : 'Đã thêm vào yêu thích',
        description: isFavorited
          ? 'Đã xóa khỏi danh sách yêu thích của bạn.'
          : 'Đã thêm vào danh sách yêu thích của bạn.',
      });
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật yêu thích. Thử lại sau.',
        variant: 'destructive',
      });
    }
  };

  const handleViewSet = (setId: string) =>
    navigate(ROUTES.VOCABULARIES.DETAIL_SET_VOCABULARY.replace(':id', setId));

  const handleCreateNewSet = async () => {
    try {
      await createEmptySetMutation.mutateAsync({
        title: 'Bộ từ vựng mới',
        language: Language.ENGLISH,
        type: VocabularySetType.FLASHCARD,
      });
    } catch {
      console.error('Failed to create vocabulary set');
    }
  };

  const loadMore = () => {
    if (hasMore) setCurrentPage((p) => p + 1);
  };

  // ── Skeleton helpers ─────────────────────────────────────────────────────────
  const skeletonCard = (key: number) => (
    <div
      key={key}
      className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"
    />
  );
  const skeletonRow = (key: number) => (
    <div
      key={key}
      className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"
    />
  );

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      {/* ═══════════════════════════════════════════════════════════ HERO BANNER */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-blue-100 dark:border-slate-800 shadow-sm">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-200/40 dark:bg-blue-900/20 blur-3xl" />
        <div className="absolute -bottom-8 -left-8  w-48 h-48 rounded-full bg-indigo-200/30 dark:bg-indigo-900/20 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8 sm:p-10">
          {/* Left content */}
          <div className="flex-1 flex flex-col gap-4 text-left">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800">
                <Sparkles className="w-3 h-3" /> Cộng đồng học tập
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-900 dark:text-blue-100 leading-tight">
              Học từ vựng cùng{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Cộng đồng
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium max-w-lg">
              Khám phá hàng ngàn bộ từ vựng chất lượng cao được tạo bởi các
              chuyên gia và học viên trên toàn thế giới.
            </p>

            {/* Search + Create */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Tìm IELTS, TOEIC, Business English…"
                  className="pl-10 h-11 w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/30"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                onClick={handleCreateNewSet}
                disabled={createEmptySetMutation.isLoading}
                className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/20 shrink-0 cursor-pointer"
              >
                {createEmptySetMutation.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Tạo bộ từ mới
              </Button>
            </div>
          </div>

          {/* Right decoration */}
          <div className="hidden md:flex shrink-0">
            <div className="w-44 h-44 rounded-3xl bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-inner flex items-center justify-center">
              <BookOpen className="w-20 h-20 text-blue-400/70 dark:text-blue-500/70" />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════ CATEGORY CAPSULES */}
      <div className="relative w-full flex items-center group">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-md text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 transition-all cursor-pointer"
            aria-label="Previous categories"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Left Fade Overlay */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none z-10 transition-opacity duration-300" />
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="w-full flex items-center gap-2 overflow-x-auto py-1.5 scroll-smooth scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {[{ value: null, label: 'Tất cả' }, ...CATEGORY_LIST].map((cat) => {
            const active = selectedCategory === cat.value;
            return (
              <button
                key={cat.value ?? '__all'}
                onClick={() => setSelectedCategory(cat.value)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Right Fade Overlay */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none z-10 transition-opacity duration-300" />
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-md text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 transition-all cursor-pointer"
            aria-label="Next categories"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>


      {/* ═══════════════════════════════════════════ MAIN 3-COL + SIDEBAR GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8 items-start">
        {/* ─── LEFT: all content ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-8 min-w-0">
          {/* ── TRENDING SECTION (top 3 cards) ──────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                Đang thịnh hành
              </h2>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide cursor-pointer hover:underline">
                Xem tất cả →
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {isLoading && accumulatedSets.length === 0
                ? [0, 1, 2].map(skeletonCard)
                : accumulatedSets.slice(0, 3).map((set, idx) => {
                    const isFav = set.isFavorited ?? false;
                    return (
                      <article
                        key={set.id}
                        onClick={() => handleViewSet(set.id)}
                        className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                      >
                        {/* Thumbnail */}
                        <div className="relative h-36 overflow-hidden bg-slate-800 shrink-0">
                          <img
                            src={coverFor(set, idx)}
                            alt={set.title}
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <Badge className="absolute top-2.5 right-2.5 text-[9px] font-black tracking-widest text-white bg-blue-600 border-none px-2 py-0.5 rounded">
                            {set.entryCount > 30 ? 'HOT' : 'NEW'}
                          </Badge>
                          <span className="absolute bottom-2.5 left-2.5 text-[10px] font-bold text-white/90 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded">
                            {set.language?.toUpperCase() || 'EN'} ·{' '}
                            {set.entryCount} từ
                          </span>
                        </div>

                        {/* Body */}
                        <div className="flex flex-col gap-3 p-4 flex-1">
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {set.title}
                            </h3>
                            {set.creator?.name && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                <span className="inline-flex w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/50 items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-[9px]">
                                  {set.creator.name.charAt(0).toUpperCase()}
                                </span>
                                {set.creator.name}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-0.5 text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-500" />
                              <span className="text-xs font-bold">
                                {(
                                  4.5 +
                                  (parseInt(set.id.substring(0, 2), 16) % 6) *
                                    0.1
                                ).toFixed(1)}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                                ({set.favoriteCount})
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(set.id, isFav);
                              }}
                              className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  isFav ? 'fill-red-500 text-red-500' : ''
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
            </div>
          </section>

          {/* ── ALL DOCUMENTS LIST ──────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            {/* Header + Tabs */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                Tất cả tài liệu
                {paginationMeta?.total != null && (
                  <span className="ml-2 text-sm font-medium text-slate-400">
                    ({paginationMeta.total})
                  </span>
                )}
              </h2>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                {(['featured', 'recent', 'popular'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === tab
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab === 'featured'
                      ? 'Phổ biến'
                      : tab === 'recent'
                      ? 'Mới nhất'
                      : 'Yêu thích'}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3">
              {isLoading && accumulatedSets.length === 0 ? (
                [0, 1, 2, 3, 4].map(skeletonRow)
              ) : accumulatedSets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-700 dark:text-slate-300">
                    Không tìm thấy học liệu
                  </h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
                    Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
                  </p>
                </div>
              ) : (
                accumulatedSets.map((set, idx) => {
                  const { label: lvl, cls: lvlCls } = levelInfo(set.entryCount);
                  const isFav = set.isFavorited ?? false;
                  return (
                    <div
                      key={set.id}
                      onClick={() => handleViewSet(set.id)}
                      className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 rounded-2xl cursor-pointer transition-all group shadow-sm hover:shadow-md"
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                        <img
                          src={coverFor(set, idx)}
                          alt={set.title}
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${lvlCls}`}
                          >
                            {lvl}
                          </span>
                          <span className="flex items-center gap-0.5 text-amber-500">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span className="text-[11px] font-bold">
                              {(
                                4.5 +
                                (parseInt(set.id.substring(0, 2), 16) % 6) * 0.1
                              ).toFixed(1)}
                            </span>
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {set.title}
                        </h3>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          {set.creator?.name && (
                            <span className="truncate max-w-[140px]">
                              By{' '}
                              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                                {set.creator.name}
                              </span>
                            </span>
                          )}
                          <span className="w-px h-3 bg-slate-200 dark:bg-slate-700 shrink-0" />
                          <span>{set.entryCount} từ</span>
                          {set.favoriteCount > 0 && (
                            <>
                              <span className="w-px h-3 bg-slate-200 dark:bg-slate-700 shrink-0" />
                              <span className="flex items-center gap-0.5">
                                <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                                {set.favoriteCount}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewSet(set.id);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg px-3 h-8 cursor-pointer"
                        >
                          Học ngay
                        </Button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(set.id, isFav);
                          }}
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isFav ? 'fill-red-500 text-red-500' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoading}
                  className="h-10 px-6 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Tải thêm kết quả</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </section>
        </div>

        {/* ─── RIGHT: SIDEBAR ────────────────────────────────────────────────── */}
        <aside className="flex flex-col gap-5 w-full xl:w-[300px]">
          {/* ── TOP CONTRIBUTORS (100% real data) ──────────────────────────── */}
          <Card className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800 pb-3 pt-4 px-4">
              <CardTitle className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Bảng vàng Đóng góp
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-1">
              {isLoading && topContributors.length === 0 ? (
                [0, 1, 2, 3].map((k) => (
                  <div
                    key={k}
                    className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
                  />
                ))
              ) : topContributors.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
                  Chưa có dữ liệu đóng góp.
                </p>
              ) : (
                topContributors.map((contributor, index) => (
                  <div
                    key={contributor.name}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {/* Rank badge */}
                    <div
                      className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black shrink-0 ${
                        RANK_COLOURS[index] ?? RANK_COLOURS[3]
                      }`}
                    >
                      {index + 1}
                    </div>
                    {/* Avatar initial */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                      {contributor.initial}
                    </div>
                    {/* Name + count */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                        {contributor.name}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {contributor.sets} học liệu
                      </p>
                    </div>
                    {/* Score badge */}
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 px-2 py-0.5 rounded-lg shrink-0">
                      +{contributor.sets * 10}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* ── COMMUNITY STATS ────────────────────────────────────────────── */}
          <Card className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800 pb-3 pt-4 px-4">
              <CardTitle className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                Thống kê Cộng đồng
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* Total documents — real from API */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <Library className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    Tài liệu
                  </p>
                  <p className="text-lg font-black text-blue-600 dark:text-blue-400 leading-none mt-0.5">
                    {paginationMeta?.total ?? '—'}
                  </p>
                </div>
              </div>

              {/* Unique contributors — real from data */}
              <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    Người đóng góp
                  </p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none mt-0.5">
                    {topContributors.length > 0
                      ? `${topContributors.length}+`
                      : '—'}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic text-center pt-1 leading-relaxed">
                "Chia sẻ kiến thức là cách nhanh nhất để làm chủ ngôn ngữ."
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
