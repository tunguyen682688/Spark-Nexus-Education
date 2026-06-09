import React from 'react';
import { Search } from 'lucide-react';
import { Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@spark-nest-ed/frontend-shared-components';

interface VocabularyFilterSetProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedLevel: string | null;
  setSelectedLevel: (value: string | null) => void;
  selectedTag: string | null;
  setSelectedTag: (value: string | null) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (value: boolean) => void;
  resetFilters: () => void;
  allTags: string[];
  sortBy: "word" | "level" | "mastery" | "lastReviewed";
  sortOrder: "asc" | "desc";
  handleSort: (field: "word" | "level" | "mastery" | "lastReviewed") => void;
}

const VocabularyFilterSet: React.FC<VocabularyFilterSetProps> = ({
  searchTerm,
  setSearchTerm,
  selectedLevel,
  setSelectedLevel,
  selectedTag,
  setSelectedTag,
  showFavoritesOnly,
  setShowFavoritesOnly,
  resetFilters,
  allTags,
  sortBy,
  sortOrder,
  handleSort,
}) => {
  return (
    <div>
      <div className="dark:bg-gray-800 bg-white rounded-xl p-4 mb-6 dark:shadow-dark shadow-md transition-colors">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              className="pl-8"
              placeholder="Search words, meanings, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              value={selectedLevel || undefined}
              onValueChange={(value) => setSelectedLevel(value === "all" ? null : value || null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="ELEMENTARY">Elementary</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="UPPER_INTERMEDIATE">Upper Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedTag || undefined}
              onValueChange={(value) => setSelectedTag(value === "all" ? null : value || null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              Favorites
            </Button>

            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Sorting Options */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="dark:text-gray-400 text-gray-500 self-center mr-2 transition-colors">
          Sort by:
        </span>
        <Button
          variant={sortBy === "word" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSort("word")}
        >
          Word {sortBy === "word" && (sortOrder === "asc" ? "↑" : "↓")}
        </Button>
        <Button
          variant={sortBy === "level" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSort("level")}
        >
          Level {sortBy === "level" && (sortOrder === "asc" ? "↑" : "↓")}
        </Button>
        <Button
          variant={sortBy === "mastery" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSort("mastery")}
        >
          Mastery {sortBy === "mastery" && (sortOrder === "asc" ? "↑" : "↓")}
        </Button>
        <Button
          variant={sortBy === "lastReviewed" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSort("lastReviewed")}
        >
          Last Reviewed{" "}
          {sortBy === "lastReviewed" && (sortOrder === "asc" ? "↑" : "↓")}
        </Button>
      </div>
    </div>
  );
};

export default VocabularyFilterSet;
