import {
  Filter,
  ChevronDown,
  Search,
  Grid,
  List,
} from 'lucide-react';
import {
  Input,
} from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

interface PurchasedFilterBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sortBy: string;
  setSortBy: (s: 'recent' | 'price' | 'progress') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  itemsCount: number;
  text: typeof CERTIFICATION_UI_TEXT.purchasedCollections;
}

export const PurchasedFilterBar = ({
  activeTab,
  setActiveTab,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  itemsCount,
  text,
}: PurchasedFilterBarProps) => {
  return (
    <>
      <div className="flex items-center justify-between border-b border-border pb-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          {[
            { id: 'All', label: `All (${itemsCount})` },
            { id: 'Official Bundles', label: 'Official Bundles' },
            { id: 'IELTS Pro', label: 'IELTS Pro' },
            { id: 'TOEIC Master', label: 'TOEIC Master' },
            { id: 'Lifetime Access', label: 'Lifetime Access' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold transition-all rounded-lg cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-indigo-600 font-extrabold border-b-2 border-indigo-600 rounded-b-none'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl flex-shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={text.searchPlaceholder}
          className="pl-8 text-xs bg-background py-2 h-9 rounded-xl"
        />
      </div>
    </>
  );
};
