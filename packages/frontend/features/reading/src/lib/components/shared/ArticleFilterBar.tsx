import React, { useState } from 'react';
import { Button, Popover, PopoverContent, PopoverTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsList, TabsTrigger } from '@spark-nest-ed/frontend-shared-components';
import { Filter, ArrowUpDown, Check } from 'lucide-react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';

interface FilterState {
  category: string;
  difficulty: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ArticleFilterBarProps {
  onFilterChange: (filters: Partial<FilterState>) => void;
  activeCategory: string;
}

export const ArticleFilterBar: React.FC<ArticleFilterBarProps> = ({
  onFilterChange,
  activeCategory,
}) => {
  const [difficulty, setDifficulty] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');

  const categories = [
    { label: 'All', value: 'ALL' },
    { label: 'Technology', value: 'technology' },
    { label: 'Science', value: 'science' },
    { label: 'Literature', value: 'literature' },
    { label: 'Business', value: 'business' },
  ];

  const handleCategoryChange = (val: string) => {
    onFilterChange({ category: val === 'ALL' ? undefined : val });
  };

  const applyDifficulty = (val: string) => {
    setDifficulty(val);
    onFilterChange({ difficulty: val === 'ALL' ? undefined : val });
  };

  const applyStatus = (val: string) => {
    setStatus(val);
    onFilterChange({ status: val === 'ALL' ? undefined : val.toLowerCase() });
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    const order = val === 'wordCount' || val === 'readTime' ? 'asc' : 'desc';
    onFilterChange({ sortBy: val, sortOrder: order });
  };

  return (
    <div className="space-y-4">
      {/* Header filter controls */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800 transition-colors">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Discover Articles</h2>
        <div className="flex gap-2">
          {/* Filters Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 dark:bg-slate-900 gap-1.5 text-xs font-bold rounded transition-colors">
                <Filter className="h-3.5 w-3.5" /> Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 space-y-4 border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-md transition-colors">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-colors">CEFR Level</label>
                <Select value={difficulty} onValueChange={applyDifficulty}>
                  <SelectTrigger className="w-full h-8 border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs transition-colors">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                    <SelectItem value="ALL">All Levels</SelectItem>
                    <SelectItem value="A1">A1 Level</SelectItem>
                    <SelectItem value="A2">A2 Level</SelectItem>
                    <SelectItem value="B1">B1 Level</SelectItem>
                    <SelectItem value="B2">B2 Level</SelectItem>
                    <SelectItem value="C1">C1 Level</SelectItem>
                    <SelectItem value="C2">C2 Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-colors">Reading Status</label>
                <Tabs value={status} onValueChange={applyStatus} className="w-full">
                  <TabsList className="grid grid-cols-3 h-8 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-0.5 transition-colors">
                    <TabsTrigger value="ALL" className="text-[10px] font-bold py-1 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white">All</TabsTrigger>
                    <TabsTrigger value="IN_PROGRESS" className="text-[10px] font-bold py-1 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white">Reading</TabsTrigger>
                    <TabsTrigger value="COMPLETED" className="text-[10px] font-bold py-1 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white">Done</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort Select */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 dark:bg-slate-900 gap-1.5 text-xs font-bold rounded transition-colors">
                <ArrowUpDown className="h-3.5 w-3.5" /> Sort
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-md space-y-1 transition-colors">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 py-1.5 block transition-colors">Sort By</label>
              {[
                { label: 'Newest Articles', value: 'createdAt' },
                { label: 'Word Count (Shortest)', value: 'wordCount' },
                { label: 'Reading Speed Target', value: 'difficulty' },
              ].map((opt) => (
                <Button
                  key={opt.value}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between font-medium text-xs px-2.5 text-slate-700 dark:text-slate-300 hover:dark:bg-slate-800 transition-colors"
                  onClick={() => handleSortChange(opt.value)}
                >
                  {opt.label}
                  {sortBy === opt.value && <Check className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />}
                </Button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Category Chips Tab list */}
      <div className="flex gap-2 flex-wrap items-center">
        {categories.map((cat) => {
          const isActive = (cat.value === 'ALL' && !activeCategory) || activeCategory === cat.value;
          return (
            <Button
              key={cat.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className={cn(
                "h-7 px-4 rounded-full text-xs font-bold border-slate-200/80 dark:border-slate-700 transition-colors",
                isActive
                  ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
              onClick={() => handleCategoryChange(cat.value)}
            >
              {cat.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
