import React from 'react';
import { Search, Filter, Plus, X } from 'lucide-react';
import { Button, Input, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, Badge } from '@spark-nest-ed/frontend-shared-components';
import { CATEGORY_LIST, ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { useNavigate } from 'react-router-dom';
import { COMMUNITY_TEXT } from '../../constants';

export interface CommunityVocabularySetHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (newSortBy: string, newDirection: 'asc' | 'desc') => void;
  onCreateNewSet?: () => void | Promise<void>;
  isCreatingSet?: boolean;
}

const CommunityVocabularySetHeader: React.FC<CommunityVocabularySetHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  selectedCategory,
  onCategorySelect,
  sortBy,
  sortDirection,
  onSortChange,
  onCreateNewSet,
  isCreatingSet = false,
}) => {
  const navigate = useNavigate();

  const handleCreateClick = async () => {
    if (onCreateNewSet) {
      await onCreateNewSet();
    } else {
      navigate(ROUTES.VOCABULARIES.CREATE);
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {COMMUNITY_TEXT.HEADER.TITLE}
        </h1>
        <p className="text-muted-foreground">
          {COMMUNITY_TEXT.HEADER.SUBTITLE}
        </p>
      </div>
      <div className="flex gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={COMMUNITY_TEXT.HEADER.SEARCH_PLACEHOLDER}
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={onClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2">
              <h4 className="mb-2 text-sm font-medium">
                {COMMUNITY_TEXT.HEADER.CATEGORIES_TITLE}
              </h4>
              <div className="flex flex-wrap gap-1">
                <Badge 
                  variant={selectedCategory === null ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => onCategorySelect(null)}
                >
                  {COMMUNITY_TEXT.HEADER.ALL_CATEGORY}
                </Badge>
                {CATEGORY_LIST.slice(0, 5).map((category) => (
                  <Badge 
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"} 
                    className="cursor-pointer"
                    onClick={() => onCategorySelect(category.value)}
                  >
                    {category.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="p-2 border-t">
              <h4 className="mb-2 text-sm font-medium">
                {COMMUNITY_TEXT.HEADER.SORT_TITLE}
              </h4>
              <div className="space-y-1">
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => onSortChange("createdAt", sortDirection === "asc" ? "desc" : "asc")}
                >
                  {COMMUNITY_TEXT.HEADER.SORT_OPTIONS.DATE}{' '}
                  {sortBy === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => onSortChange("title", sortDirection === "asc" ? "desc" : "asc")}
                >
                  {COMMUNITY_TEXT.HEADER.SORT_OPTIONS.NAME}{' '}
                  {sortBy === "title" && (sortDirection === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => onSortChange("entryCount", sortDirection === "asc" ? "desc" : "asc")}
                >
                  {COMMUNITY_TEXT.HEADER.SORT_OPTIONS.WORD_COUNT}{' '}
                  {sortBy === "entryCount" && (sortDirection === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => onSortChange("favoriteCount", sortDirection === "asc" ? "desc" : "asc")}
                >
                  {COMMUNITY_TEXT.HEADER.SORT_OPTIONS.POPULARITY}{' '}
                  {sortBy === "favoriteCount" && (sortDirection === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          onClick={handleCreateClick}
          disabled={isCreatingSet}
        >
          <Plus className="mr-2 h-4 w-4" /> {COMMUNITY_TEXT.HEADER.CREATE_BUTTON}
        </Button>
      </div>
    </div>
  );
};

export default CommunityVocabularySetHeader;

