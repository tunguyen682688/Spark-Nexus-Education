import { Grid, List } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import type { CertificationUIText } from '../../constants/certification.constants';

interface CompletedCollectionsTabsProps {
  totalCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sortBy: string;
  setSortBy: (s: 'recent' | 'score' | 'time') => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  text: CertificationUIText['completedCollections'];
}

export const CompletedCollectionsTabs = ({
  totalCount,
  activeTab,
  setActiveTab,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  text,
}: CompletedCollectionsTabsProps) => {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 overflow-x-auto">
      <div className="flex items-center gap-2">
        {[
          { id: 'All', label: `All (${totalCount})` },
          { id: 'IELTS', label: 'IELTS' },
          { id: 'TOEIC', label: 'TOEIC' },
          { id: 'Listening', label: 'Listening' },
          { id: 'Reading', label: 'Reading' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
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
  );
};