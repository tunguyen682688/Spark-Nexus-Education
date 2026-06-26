import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@spark-nest-ed/frontend-shared-components';
import { CEFR_LEVELS, LISTENING_HUB_TEXT } from '../constants';
import { getDifficultyColor } from '../utils/listening-helpers';

interface HubFilterToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  isCommunity: boolean | undefined;
  setIsCommunity: (community: boolean | undefined) => void;
}

export const HubFilterToolbar: React.FC<HubFilterToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedDifficulty,
  setSelectedDifficulty,
  isCommunity,
  setIsCommunity,
}) => {
  const text = LISTENING_HUB_TEXT.FILTERS;

  return (
    <div className="flex flex-col gap-4 p-5 bg-card border border-border rounded-2xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={text.SEARCH_PLACEHOLDER}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-all"
          />
        </div>

        {/* Level Filter & Source Filter */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
            {text.LEVEL_LABEL}
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {['all', ...CEFR_LEVELS].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all uppercase ${
                  selectedDifficulty === diff
                    ? 'bg-primary border-primary text-primary-foreground'
                    : getDifficultyColor(diff)
                }`}
              >
                {diff === 'all' ? text.ALL_LEVELS : diff}
              </button>
            ))}
          </div>

          <Select
            value={
              isCommunity === undefined
                ? 'all'
                : isCommunity
                ? 'community'
                : 'system'
            }
            onValueChange={(val) => {
              if (val === 'all') setIsCommunity(undefined);
              else if (val === 'community') setIsCommunity(true);
              else setIsCommunity(false);
            }}
          >
            <SelectTrigger className="bg-card border border-border text-foreground text-xs rounded-xl px-3 py-2 h-9 focus:border-primary focus:outline-none w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{text.SOURCE_LABEL}</SelectItem>
              <SelectItem value="system">{text.SOURCE_SYSTEM}</SelectItem>
              <SelectItem value="community">{text.SOURCE_COMMUNITY}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default HubFilterToolbar;
