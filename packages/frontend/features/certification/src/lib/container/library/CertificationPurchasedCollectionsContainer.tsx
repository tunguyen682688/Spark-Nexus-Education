import {
  ShoppingBag,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Grid,
  List,
  CheckCircle2,
  DollarSign,
  Award,
  BookOpen,
  Receipt,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
} from '@spark-nest-ed/frontend-shared-components';
import { usePurchasedCollectionsContainerLogic } from '../../hooks/container-logic/library/use-purchased-collections-container-logic';
import { PurchasedCollectionCard } from '../../components/library/PurchasedCollectionCard';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

export const CertificationPurchasedCollectionsContainer = () => {
  const {
    isApiLoading,
    isError,
    refetch,
    activeTab,
    setActiveTab,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    items,
    handleOpenCollection,
    handleViewReceipt,
    handleBackToLearning,
  } = usePurchasedCollectionsContainerLogic();

  const text = CERTIFICATION_UI_TEXT.purchasedCollections;

  if (isApiLoading) {
    return <LoadingSkeleton count={6} />;
  }

  if (isError) {
    return <ErrorState message={CERTIFICATION_UI_TEXT.error.purchasedCollections} onRetry={refetch} />;
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. BREADCRUMB & HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <button
            onClick={handleBackToLearning}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            {text.breadcrumbParent}
          </button>
          <span>&gt;</span>
          <span className="text-foreground font-bold">{text.breadcrumbCurrent}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {text.title}
              </h1>
            </div>
            <Badge className="bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-extrabold text-sm px-2.5 py-0.5 rounded-full border-none">
              {items.length} Packages
            </Badge>
          </div>

          {/* TOP CONTROLS */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="text-xs font-bold py-2 px-3 h-9 rounded-xl border-border hover:bg-secondary flex items-center gap-1.5 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              {text.filterBtn}
            </Button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'price' | 'progress')}
                className="appearance-none bg-background border border-border hover:border-indigo-500/50 text-xs font-bold text-foreground py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer h-9"
              >
                <option value="recent">{text.sortOptions.recent}</option>
                <option value="price">{text.sortOptions.price}</option>
                <option value="progress">{text.sortOptions.progress}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          {text.subtitle}
        </p>
      </div>

      {/* 2. TOP METRIC CARDS ROW (5 METRICS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.purchasedItems}
            </span>
            <div className="text-xl font-black text-foreground">{items.length}</div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
              Lifetime Access
            </span>
          </div>
        </Card>

        <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.totalValue}
            </span>
            <div className="text-xl font-black text-foreground">
              ${items.reduce((acc, item) => acc + (parseFloat(item.pricePaid?.replace('$', '')) || 0), 0)}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center">
              Active subscriptions
            </span>
          </div>
        </Card>

        <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.avgCompletion}
            </span>
            <div className="text-xl font-black text-foreground">
              {items.length > 0
                ? `${Math.round(
                    items.reduce((acc, item) => acc + (item.progressPercent || 0), 0) /
                      items.length
                  )}%`
                : '0%'}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">Progress rate</span>
          </div>
        </Card>

        <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.unlockedMocks}
            </span>
            <div className="text-xl font-black text-foreground">
              {items.reduce((acc, item) => acc + (item.totalTests || 0), 0)}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">Practice tests</span>
          </div>
        </Card>

        <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.certificatesEligible}
            </span>
            <div className="text-xl font-black text-foreground">{items.length}</div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
              Available upon completion
            </span>
          </div>
        </Card>
      </div>

      {/* 3. MAIN LAYOUT GRID (2 COLUMNS) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: CATEGORY TABS, SEARCH & CARDS GRID */}
        <div className="xl:col-span-2 space-y-6">
          {/* CATEGORY TABS & VIEW TOGGLE */}
          <div className="flex items-center justify-between border-b border-border pb-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              {[
                { id: 'All', label: `All (${items.length})` },
                { id: 'Official Bundles', label: 'Official Bundles' },
                { id: 'IELTS Pro', label: 'IELTS Pro' },
                { id: 'TOEIC Master', label: 'TOEIC Master' },
                { id: 'Lifetime Access', label: 'Lifetime Access' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-3 py-1.5 text-xs font-bold transition-all rounded-lg cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-indigo-600 font-extrabold border-b-2 border-indigo-600 rounded-b-none'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* VIEW MODE TOGGLE */}
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SUB-SEARCH BAR */}
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={text.searchPlaceholder}
              className="pl-8 text-xs bg-background py-2 h-9 rounded-xl"
            />
          </div>

          {/* CARDS GRID OR EMPTY STATE */}
          {items.length === 0 ? (
            <Card className="border-border p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-foreground">{text.emptyState.title}</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {text.emptyState.description}
                </p>
              </div>
              <Button
                onClick={handleBackToLearning}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
              >
                {text.emptyState.exploreBtn}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {items.map((item) => (
                <PurchasedCollectionCard
                  key={item.id}
                  item={item}
                  onOpenCollection={handleOpenCollection}
                  onViewReceipt={handleViewReceipt}
                />
              ))}
            </div>
          )}

          {/* PAGINATION FOOTER */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-border rounded-xl bg-card gap-3 text-xs text-muted-foreground shadow-sm">
            <span>Showing 1 to 6 of 12 collections</span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-border hover:bg-secondary disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(1)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === 1
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'border border-border hover:bg-secondary'
                }`}
              >
                1
              </button>
              <button
                onClick={() => setCurrentPage(2)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === 2
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'border border-border hover:bg-secondary'
                }`}
              >
                2
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(2, prev + 1))}
                className="p-1.5 rounded-lg border border-border hover:bg-secondary cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span>Show</span>
              <select className="bg-background border border-border text-xs font-bold py-1 px-2 rounded-lg">
                <option value="6">6</option>
                <option value="12">12</option>
              </select>
              <span>per page</span>
            </div>
          </div>
        </div>

        {/* RIGHT 1 COLUMN: SIDEBAR WIDGETS */}
        <div className="space-y-6">
          {/* WIDGET 1: RECENT PURCHASES HISTORY */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">{text.widgets.recentPurchasesTitle}</CardTitle>
              <button className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer">
                {text.widgets.viewReceiptsBtn}
              </button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Receipt className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span className="font-extrabold text-foreground truncate">
                    IELTS Academic Masterclass
                  </span>
                </div>
                <span className="font-black text-emerald-600">$49.00</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Receipt className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="font-extrabold text-foreground truncate">
                    TOEIC 900+ Exam Package
                  </span>
                </div>
                <span className="font-black text-emerald-600">$39.00</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Receipt className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="font-extrabold text-foreground truncate">
                    VSTEP B2/C1 Test Collection
                  </span>
                </div>
                <span className="font-black text-emerald-600">$29.00</span>
              </div>
            </CardContent>
          </Card>

          {/* WIDGET 2: GUARANTEE & BENEFITS BOX */}
          <Card className="border-indigo-200 bg-indigo-50/40 dark:bg-indigo-950/20 dark:border-indigo-900/40 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h5 className="font-extrabold text-xs text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                  {text.widgets.benefitsTitle}
                </h5>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground font-medium">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{text.benefits.b1}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{text.benefits.b2}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{text.benefits.b3}</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full text-xs font-bold py-2 border-indigo-300 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                {text.widgets.browseStoreBtn}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
