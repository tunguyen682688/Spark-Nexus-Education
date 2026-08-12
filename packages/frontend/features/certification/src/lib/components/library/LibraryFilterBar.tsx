import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { Input } from '@spark-nest-ed/frontend-shared-components';

const LIBRARY_EXAM_FILTERS = [
  { id: 'All', label: 'All Exams' },
  { id: 'IELTS', label: 'IELTS' },
  { id: 'TOEIC', label: 'TOEIC' },
  { id: 'TOEFL', label: 'TOEFL' },
  { id: 'VSTEP', label: 'VSTEP' },
  { id: 'Cambridge', label: 'Cambridge' },
];

interface LibraryFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedExamFilter: string;
  setSelectedExamFilter: (f: string) => void;
  sortBy: string;
  setSortBy: (s: 'recent' | 'title') => void;
  searchPlaceholder: string;
}

export const LibraryFilterBar = ({
  searchQuery,
  setSearchQuery,
  selectedExamFilter,
  setSelectedExamFilter,
  sortBy,
  setSortBy,
  searchPlaceholder,
}: LibraryFilterBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9 text-xs bg-background"
        />
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <Filter className="w-4 h-4 text-muted-foreground mr-1 flex-shrink-0" />
        {LIBRARY_EXAM_FILTERS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedExamFilter(opt.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              selectedExamFilter === opt.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-secondary/70 text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}

        <div className="ml-2 border-l border-border pl-2 flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'title')}
            className="text-xs font-bold text-foreground bg-transparent border-none focus:outline-none cursor-pointer"
          >
            <option value="recent">Gần đây</option>
            <option value="title">Tên A-Z</option>
          </select>
        </div>
      </div>
    </div>
  );
};
