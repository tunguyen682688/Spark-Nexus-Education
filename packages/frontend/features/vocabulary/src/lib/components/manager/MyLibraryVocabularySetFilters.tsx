import React from 'react';
import { Search, ListFilter, ArrowUpDown } from 'lucide-react';
import { Input, Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@spark-nest-ed/frontend-shared-components';
import { MY_LIBRARY_TEXT } from '../../constants';

export interface MyLibraryVocabularySetFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string | null;
  categories: string[];
  onCategorySelect: (category: string) => void;
  sortLabel: string;
  onSortChange: (sortField: string) => void;
}

const MyLibraryVocabularySetFilters: React.FC<MyLibraryVocabularySetFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  categories,
  onCategorySelect,
  sortLabel,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Bar */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={MY_LIBRARY_TEXT.FILTERS.SEARCH_PLACEHOLDER}
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <ListFilter className="mr-2 h-4 w-4" />
            {selectedCategory === null
              ? MY_LIBRARY_TEXT.FILTERS.ALL_CATEGORIES
              : selectedCategory}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {categories.map((category, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => onCategorySelect(category)}
            >
              {category}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            {MY_LIBRARY_TEXT.FILTERS.SORT_PREFIX} {sortLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onSortChange("recent")}>
            {MY_LIBRARY_TEXT.FILTERS.SORT_OPTIONS.RECENT}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("words")}>
            {MY_LIBRARY_TEXT.FILTERS.SORT_OPTIONS.WORDS}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("progress")}>
            {MY_LIBRARY_TEXT.FILTERS.SORT_OPTIONS.PROGRESS}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MyLibraryVocabularySetFilters;

