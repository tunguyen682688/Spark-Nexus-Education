import React from 'react';
import { Search, ListFilter } from 'lucide-react';
import { Input, Button, Badge, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@spark-nest-ed/frontend-shared-components';
import { CEFR_LEVELS, LISTENING_EXPLORE_TEXT } from '../constants';
import { getDifficultyColor } from '../utils/listening-helpers';

interface ExploreFiltersSidebarProps {
  category: string;
  difficulty: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  handleResetFilters: () => void;
  handleDifficultyChange: (difficulty: string) => void;
  handleApplyPreset: (category: string, difficulty: string) => void;
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
  handleApplyPreset,
}) => {
  const text = LISTENING_EXPLORE_TEXT.SIDEBAR;
  const difficulties = ['all', ...CEFR_LEVELS] as const;

  const isFiltered = category !== 'all' || difficulty !== 'all' || searchQuery !== '' || sortBy !== 'newest';

  return (
    <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-5 backdrop-blur-md space-y-6">
      {/* Header sidebar */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-primary" />
          {text.TITLE}
        </span>
        {isFiltered && (
          <Button
            variant="link"
            size="sm"
            onClick={handleResetFilters}
            className="text-[10px] font-bold text-primary hover:underline h-auto p-0"
          >
            {text.RESET_CTA}
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">{text.KEYWORD_LABEL}</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={text.KEYWORD_PLACEHOLDER}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Sắp xếp */}
      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">{text.SORT_LABEL}</label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full bg-background border border-border text-foreground text-xs font-bold rounded-xl px-3 py-2.5 h-10 focus:border-primary focus:outline-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{text.SORT_OPTIONS.NEWEST}</SelectItem>
            <SelectItem value="views">{text.SORT_OPTIONS.VIEWS}</SelectItem>
            <SelectItem value="subtitles">{text.SORT_OPTIONS.SUBTITLES}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lọc cấp độ */}
      <div className="space-y-3">
        <label className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider block">{text.CEFR_LABEL}</label>
        <div className="grid grid-cols-3 gap-2">
          {difficulties.map((diff) => (
            <Button
              key={diff}
              variant="outline"
              size="sm"
              onClick={() => handleDifficultyChange(diff)}
              className={`py-2 h-auto text-[10px] font-black rounded-xl border transition-all uppercase text-center ${
                difficulty === diff
                  ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10 hover:bg-primary/90'
                  : getDifficultyColor(diff)
              }`}
            >
              {diff === 'all' ? text.ALL_LEVELS : diff}
            </Button>
          ))}
        </div>
      </div>

      {/* Gợi ý học tập (Presets) */}
      <div className="space-y-3 pt-4 border-t border-border/60">
        <label className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider block">Gợi ý học tập</label>
        <div className="space-y-2">
          {[
            { label: 'Luyện thi IELTS (B2)', category: 'exam', difficulty: 'B2' },
            { label: 'Giao tiếp hàng ngày (B1)', category: 'podcast', difficulty: 'B1' },
            { label: 'Tin tức học thuật (C1)', category: 'news', difficulty: 'C1' },
            { label: 'Tiếng Anh sơ cấp (A2)', category: 'video', difficulty: 'A2' },
          ].map((preset, idx) => (
            <Button
              key={idx}
              variant="outline"
              onClick={() => handleApplyPreset(preset.category, preset.difficulty)}
              className="w-full flex items-center justify-between p-2.5 h-auto rounded-xl border border-border bg-secondary/20 hover:bg-secondary/50 text-left text-xs font-bold text-foreground transition-all"
            >
              <span>{preset.label}</span>
              <Badge className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{preset.difficulty}</Badge>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreFiltersSidebar;
