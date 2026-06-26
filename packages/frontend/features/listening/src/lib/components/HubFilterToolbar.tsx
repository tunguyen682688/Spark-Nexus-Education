import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@spark-nest-ed/frontend-shared-components';
import { CEFR_LEVELS, LISTENING_HUB_TEXT } from '../constants';

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

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'A1':
      case 'A2':
        return 'border-green-500/35 text-green-400 bg-green-500/5';
      case 'B1':
      case 'B2':
        return 'border-blue-500/35 text-blue-450 bg-blue-500/5';
      case 'C1':
      case 'C2':
        return 'border-purple-500/35 text-purple-400 bg-purple-500/5';
      default:
        return 'border-slate-800 text-slate-400 bg-slate-900/35';
    }
  };

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

          <select
            value={
              isCommunity === undefined
                ? 'all'
                : isCommunity
                ? 'community'
                : 'system'
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'all') setIsCommunity(undefined);
              else if (val === 'community') setIsCommunity(true);
              else setIsCommunity(false);
            }}
            className="bg-card border border-border text-foreground text-xs rounded-xl px-3 py-2 focus:border-primary focus:outline-none"
          >
            <option value="all">{text.SOURCE_LABEL}</option>
            <option value="system">{text.SOURCE_SYSTEM}</option>
            <option value="community">{text.SOURCE_COMMUNITY}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default HubFilterToolbar;
