import React from 'react';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@spark-nest-ed/frontend-shared-components';
import { READING_UI_TEXT } from '../../constants';
import { Search, SlidersHorizontal } from 'lucide-react';

interface NewsFiltersBarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  activeLevel: string;
  handleLevelChange: (val: string) => void;
  activeDomain: string;
  handleDomainChange: (val: string) => void;
  activeTime: string;
  handleTimeChange: (val: string) => void;
  activeSort: string;
  handleSortChange: (val: string) => void;
  handleClearFilters: () => void;
}

export const NewsFiltersBar: React.FC<NewsFiltersBarProps> = ({
  searchTerm,
  setSearchTerm,
  activeLevel,
  handleLevelChange,
  activeDomain,
  handleDomainChange,
  activeTime,
  handleTimeChange,
  activeSort,
  handleSortChange,
  handleClearFilters,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col gap-4 my-6">
      {/* Row 1: Search input and right dropdown selectors */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder={READING_UI_TEXT.news.SEARCH_PLACEHOLDER}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 py-5 focus-visible:ring-blue-500 text-sm"
          />
        </div>

        {/* Right Selectors */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center shrink-0">
          {/* CEFR Level Select */}
          <Select value={activeLevel} onValueChange={handleLevelChange}>
            <SelectTrigger className="w-full sm:w-[150px] rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
              <SelectValue placeholder={READING_UI_TEXT.news.ALL_CEFR} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{READING_UI_TEXT.news.ALL_CEFR}</SelectItem>
              <SelectItem value="A1">{READING_UI_TEXT.components.shared.FILTER_LEVEL_A1}</SelectItem>
              <SelectItem value="A2">{READING_UI_TEXT.components.shared.FILTER_LEVEL_A2}</SelectItem>
              <SelectItem value="B1">{READING_UI_TEXT.components.shared.FILTER_LEVEL_B1}</SelectItem>
              <SelectItem value="B2">{READING_UI_TEXT.components.shared.FILTER_LEVEL_B2}</SelectItem>
              <SelectItem value="C1">{READING_UI_TEXT.components.shared.FILTER_LEVEL_C1}</SelectItem>
              <SelectItem value="C2">{READING_UI_TEXT.components.shared.FILTER_LEVEL_C2}</SelectItem>
            </SelectContent>
          </Select>

          {/* Domain Select */}
          <Select value={activeDomain} onValueChange={handleDomainChange}>
            <SelectTrigger className="w-full sm:w-[150px] rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
              <SelectValue placeholder={READING_UI_TEXT.news.ALL_DOMAINS} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{READING_UI_TEXT.news.ALL_DOMAINS}</SelectItem>
              <SelectItem value="technology">{READING_UI_TEXT.news.DOMAIN_TECH}</SelectItem>
              <SelectItem value="environment">{READING_UI_TEXT.news.DOMAIN_ENV}</SelectItem>
              <SelectItem value="science">{READING_UI_TEXT.news.DOMAIN_SCI}</SelectItem>
              <SelectItem value="business">{READING_UI_TEXT.news.DOMAIN_BIZ}</SelectItem>
              <SelectItem value="arts">{READING_UI_TEXT.news.DOMAIN_ARTS}</SelectItem>
              <SelectItem value="education">{READING_UI_TEXT.news.DOMAIN_EDU}</SelectItem>
              <SelectItem value="phonetics">{READING_UI_TEXT.news.DOMAIN_PHONETICS}</SelectItem>
              <SelectItem value="ai in education">{READING_UI_TEXT.news.DOMAIN_AI}</SelectItem>
              <SelectItem value="quantum computing">{READING_UI_TEXT.news.DOMAIN_QUANTUM}</SelectItem>
            </SelectContent>
          </Select>

          {/* Time Select */}
          <Select value={activeTime} onValueChange={handleTimeChange}>
            <SelectTrigger className="w-full sm:w-[130px] rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
              <SelectValue placeholder={READING_UI_TEXT.news.TIME_ALL} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{READING_UI_TEXT.news.TIME_ALL}</SelectItem>
              <SelectItem value="today">{READING_UI_TEXT.news.TIME_TODAY}</SelectItem>
              <SelectItem value="week">{READING_UI_TEXT.news.TIME_WEEK}</SelectItem>
              <SelectItem value="month">{READING_UI_TEXT.news.TIME_MONTH}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Sort dropdown and blue filter reset/apply button */}
      <div className="flex justify-end gap-3 items-center">
        {/* Sort Select */}
        <Select value={activeSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[150px] rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
            <SelectValue placeholder={READING_UI_TEXT.news.SORT_POPULAR} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">{READING_UI_TEXT.news.SORT_POPULAR}</SelectItem>
            <SelectItem value="newest">{READING_UI_TEXT.news.SORT_NEWEST}</SelectItem>
          </SelectContent>
        </Select>

        {/* Filters Button */}
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-5 py-4 border-none text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          onClick={handleClearFilters}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {READING_UI_TEXT.news.FILTERS}
        </Button>
      </div>
    </div>
  );
};
