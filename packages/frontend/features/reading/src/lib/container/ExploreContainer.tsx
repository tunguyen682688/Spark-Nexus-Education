import React from 'react';
import {
  Button,
  Input,
  Badge,
  Skeleton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@spark-nest-ed/frontend-shared-components';
import { Search, SlidersHorizontal, Clock, ArrowRight, UserPlus, ChevronRight, BookOpen, Database, FolderX } from 'lucide-react';
import type { Article } from '../types';
import { ArticleCard } from '../components/shared/ArticleCard';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_ARTICLE_THUMBNAIL, ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { EXPLORE_DATA, READING_UI_TEXT } from '../constants';
import { useExploreContainer } from '../hooks/use-explore-container';

export const ExploreContainer: React.FC = () => {
  const navigate = useNavigate();

  const {
    activeLevel,
    setActiveLevel,
    searchTerm,
    setSearchTerm,
    featuredArticle,
    isFeaturedLoading,
    latestNews,
    isNewsLoading,
    newBooks,
    isBooksLoading,
    topShared,
    isCommunityLoading,
  } = useExploreContainer();

  const levels = EXPLORE_DATA.LEVELS;
  const keywords = EXPLORE_DATA.KEYWORDS;
  const savedFilters = EXPLORE_DATA.SAVED_FILTERS;
  const topContributors = EXPLORE_DATA.TOP_CONTRIBUTORS;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 bg-background min-h-screen font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col items-center mb-10 space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {READING_UI_TEXT.explore.TITLE}
        </h1>
        
        {/* Search Bar */}
        <div className="w-full max-w-2xl relative flex items-center shadow-sm">
          <Search className="absolute left-4 h-5 w-5 text-slate-400" />
          <Input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={READING_UI_TEXT.explore.SEARCH_PLACEHOLDER}
            className="w-full pl-12 pr-36 py-6 text-base rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" className="absolute right-2 h-9 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                {READING_UI_TEXT.explore.ADVANCED_FILTERS}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{READING_UI_TEXT.explore.ADVANCED_FILTERS}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{READING_UI_TEXT.explore.CATEGORIES_HEADING}</h4>
                  <div className="flex flex-wrap gap-2">
                    {EXPLORE_DATA.CATEGORIES.map(cat => (
                      <Badge 
                        key={cat} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 py-1.5 px-3 transition-colors" 
                        onClick={() => setSearchTerm(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{READING_UI_TEXT.explore.READ_TIME_HEADING}</h4>
                  <div className="flex gap-2">
                    {EXPLORE_DATA.READ_TIMES.map(time => (
                      <Badge 
                        key={time} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 py-1.5 px-3 transition-colors"
                      >
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <Button variant="ghost" onClick={() => { setSearchTerm(''); setActiveLevel(''); }}>{READING_UI_TEXT.explore.CLEAR_ALL}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{READING_UI_TEXT.explore.LEVEL_LABEL}</span>
          <div className="flex gap-2">
            {levels.map(level => (
              <button
                key={level}
                onClick={() => setActiveLevel(activeLevel === level ? '' : level)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border transition-all ${
                  activeLevel === level 
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm' 
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (8/12) */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Featured Research Hero */}
          {isFeaturedLoading ? (
            <Skeleton className="w-full h-80 rounded-2xl" />
          ) : featuredArticle ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row cursor-pointer hover:shadow-md transition-shadow group" onClick={() => navigate(`/reading/article/${featuredArticle.id}`)}>
              {/* Image side */}
              <div className="md:w-1/2 relative overflow-hidden">
                <img 
                  src={featuredArticle.thumbnailUrl || DEFAULT_ARTICLE_THUMBNAIL} 
                  onError={(e) => { e.currentTarget.src = DEFAULT_ARTICLE_THUMBNAIL; }}
                  alt="Featured" 
                  className="w-full h-64 md:h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-red-600 text-white border-none font-bold text-[10px] px-2 py-0.5">NEW</Badge>
                  <Badge className="bg-blue-600 text-white border-none font-bold text-[10px] px-2 py-0.5">{featuredArticle.difficulty}</Badge>
                </div>
              </div>
              {/* Content side */}
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">{READING_UI_TEXT.explore.FEATURED_RESEARCH}</span>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-4 group-hover:text-blue-600 transition-colors">
                  {featuredArticle.title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-3">
                  {featuredArticle.summary || 'Dive into the latest comprehensive study and findings about this fascinating topic.'}
                </p>
                <div className="flex items-center justify-between mb-6 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {featuredArticle.readTime || '12 min read'}
                  </div>
                  <span>{featuredArticle.author || 'Global Journal'}</span>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg py-5">
                    {READING_UI_TEXT.explore.READ_NOW}
                  </Button>
                  <Button variant="outline" className="w-12 h-10 p-0 rounded-lg shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center transition-colors">
              <Database className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                {READING_UI_TEXT.explore.NO_FEATURED}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                {READING_UI_TEXT.explore.NO_FEATURED_SUB}
              </p>
            </div>
          )}

          {/* Latest News */}
          <section>
            <div className="flex justify-between items-end mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {READING_UI_TEXT.explore.LATEST_NEWS}
              </h3>
              <button onClick={() => navigate(ROUTES.READING.NEWS)} className="text-sm font-semibold text-blue-600 hover:text-blue-700">{READING_UI_TEXT.explore.VIEW_ALL}</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isNewsLoading ? (
                Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
              ) : latestNews && latestNews.length > 0 ? (
                latestNews.map((news) => (
                  <div key={news.id} onClick={() => navigate(`/reading/article/${news.id}`)} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex gap-4 cursor-pointer hover:shadow-md transition-all group">
                    <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 relative">
                      <img 
                        src={news.thumbnailUrl || DEFAULT_ARTICLE_THUMBNAIL} 
                        onError={(e) => { e.currentTarget.src = DEFAULT_ARTICLE_THUMBNAIL; }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        alt={news.title}
                      />
                      <Badge className="absolute top-1 left-1 text-[8px] px-1 py-0 bg-slate-900/80 text-white border-none">{news.difficulty}</Badge>
                    </div>
                    <div className="flex flex-col flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 text-sm group-hover:text-blue-600 transition-colors mb-1">{news.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2">{news.summary}</p>
                      <div className="mt-auto flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3"/> {news.readTime || '4 min read'}</span>
                        <span className="text-blue-600 font-semibold flex items-center gap-1">Read Now <ChevronRight className="w-3 h-3"/></span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 text-center rounded-xl transition-colors">
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm flex flex-col items-center justify-center gap-2">
                    <FolderX className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    {READING_UI_TEXT.explore.NO_NEWS}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* New Book Releases */}
          <section>
            <div className="flex justify-between items-end mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {READING_UI_TEXT.explore.NEW_BOOKS}
              </h3>
              <button onClick={() => navigate(ROUTES.READING.ACADEMIC)} className="text-sm font-semibold text-blue-600 hover:text-blue-700">{READING_UI_TEXT.explore.VIEW_ALL}</button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {isBooksLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
              ) : newBooks && newBooks.length > 0 ? (
                newBooks.map((book) => (
                  <ArticleCard key={book.id} article={book as Article} />
                ))
              ) : (
                <div className="col-span-1 sm:col-span-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 text-center rounded-xl transition-colors">
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm flex flex-col items-center justify-center gap-2">
                    <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    {READING_UI_TEXT.explore.NO_BOOKS}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Top Shared Resources */}
          <section>
            <div className="flex justify-between items-end mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {READING_UI_TEXT.explore.TOP_SHARED}
              </h3>
              <button onClick={() => navigate(ROUTES.READING.ACADEMIC)} className="text-sm font-semibold text-blue-600 hover:text-blue-700">{READING_UI_TEXT.explore.VIEW_ALL}</button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {isCommunityLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
              ) : topShared && topShared.length > 0 ? (
                topShared.map((resource) => (
                  <ArticleCard key={resource.id} article={resource as Article} />
                ))
              ) : (
                <div className="col-span-1 sm:col-span-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 text-center rounded-xl transition-colors">
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm flex flex-col items-center justify-center gap-2">
                    <Database className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    {READING_UI_TEXT.explore.NO_SHARED}
                  </p>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN (4/12) SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Search Insights Widget */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-blue-500" /> {READING_UI_TEXT.explore.SEARCH_INSIGHTS}
            </h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{READING_UI_TEXT.explore.POPULAR_KEYWORDS}</p>
            <div className="flex flex-wrap gap-2">
              {keywords.map(kw => (
                <Badge 
                  key={kw} 
                  variant="secondary" 
                  onClick={() => setSearchTerm(kw)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 font-medium py-1 px-3 rounded-md cursor-pointer transition-colors"
                >
                  {kw}
                </Badge>
              ))}
            </div>
          </div>

          {/* Your Saved Filters Widget */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-slate-205 flex items-center gap-2 mb-4">
              <SlidersHorizontal className="w-4 h-4 text-indigo-500" /> {READING_UI_TEXT.explore.SAVED_FILTERS_TITLE}
            </h4>
            <ul className="space-y-3 mb-4">
              {savedFilters.map((filter, i) => (
                <li 
                  key={i} 
                  onClick={() => {
                    // Extract level if present (e.g., "Tech News (B2)" -> "B2")
                    const match = filter.label.match(/(A1|A2|B1|B2|C1|C2)/);
                    if (match) setActiveLevel(match[0]);
                    setSearchTerm(filter.label.replace(/\s*\(?(A1|A2|B1|B2|C1|C2)\)?\s*/g, ''));
                  }}
                  className="flex justify-between items-center text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    {filter.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full text-sm font-semibold rounded-lg">
              {READING_UI_TEXT.explore.MANAGE_FILTERS}
            </Button>
          </div>

          {/* Top Contributors Widget */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
              <UserPlus className="w-4 h-4 text-emerald-500" /> {READING_UI_TEXT.explore.TOP_CONTRIBUTORS_LABEL}
            </h4>
            <ul className="space-y-4 mb-6">
              {topContributors.map((user, i) => (
                <li key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                      i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-indigo-500' : 'bg-red-400'
                    }`}>
                      {user.initials}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200 leading-tight">{user.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{user.count} {READING_UI_TEXT.explore.RESOURCES_SHARED}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-500">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
            <Button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-bold border-none shadow-none rounded-lg">
              {READING_UI_TEXT.explore.VIEW_COMMUNITY}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};
