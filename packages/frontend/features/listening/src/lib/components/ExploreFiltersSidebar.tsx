import React from 'react';
import { Search, ListFilter } from 'lucide-react';
import { Input } from '@spark-nest-ed/frontend-shared-components';
import { CEFR_LEVELS, LISTENING_EXPLORE_TEXT } from '../constants';

interface ExploreFiltersSidebarProps {
  category: string;
  difficulty: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  handleResetFilters: () => void;
  handleDifficultyChange: (difficulty: string) => void;
}

export const ExploreFiltersSidebar: React.FC<ExploreFiltersSidebarProps> = ({
  category,
  difficulty,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  handleResetFilters,
  handleDifficultyChange,
}) => {
  const text = LISTENING_EXPLORE_TEXT.SIDEBAR;
  const difficulties = ['all', ...CEFR_LEVELS] as const;

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'A1':
      case 'A2':
        return 'border-green-500/35 text-green-400 bg-green-500/5';
      case 'B1':
      case 'B2':
        return 'border-blue-500/35 text-blue-455 bg-blue-500/5';
      case 'C1':
      case 'C2':
        return 'border-purple-500/35 text-purple-400 bg-purple-500/5';
      default:
        return 'border-slate-800 text-slate-400 bg-slate-900/35';
    }
  };

  const isFiltered = category !== 'all' || difficulty !== 'all' || searchQuery !== '' || sortBy !== 'newest';

  return (
    <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-5 backdrop-blur-md space-y-6">
      {/* Header sidebar */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-purple-455" />
          {text.TITLE}
        </span>
        {isFiltered && (
          <button
            onClick={handleResetFilters}
            className="text-[10px] font-bold text-purple-400 hover:underline"
          >
            {text.RESET_CTA}
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">{text.KEYWORD_LABEL}</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            type="text"
            placeholder={text.KEYWORD_PLACEHOLDER}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder-slate-555 focus:border-purple-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Sắp xếp */}
      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">{text.SORT_LABEL}</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-background border border-border text-foreground text-xs font-bold rounded-xl px-3 py-2.5 focus:border-purple-500 focus:outline-none"
        >
          <option value="newest">{text.SORT_OPTIONS.NEWEST}</option>
          <option value="views">{text.SORT_OPTIONS.VIEWS}</option>
          <option value="subtitles">{text.SORT_OPTIONS.SUBTITLES}</option>
        </select>
      </div>

      {/* Lọc cấp độ */}
      <div className="space-y-3">
        <label className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider block">{text.CEFR_LABEL}</label>
        <div className="grid grid-cols-3 gap-2">
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => handleDifficultyChange(diff)}
              className={`py-2 text-[10px] font-black rounded-xl border transition-all uppercase text-center ${
                difficulty === diff
                  ? 'bg-purple-650 border-purple-500 text-white shadow-md shadow-purple-600/10'
                  : getDifficultyColor(diff)
              }`}
            >
              {diff === 'all' ? text.ALL_LEVELS : diff}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreFiltersSidebar;
