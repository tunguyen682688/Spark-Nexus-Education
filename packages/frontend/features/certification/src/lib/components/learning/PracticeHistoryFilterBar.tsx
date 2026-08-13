import {
  List,
  Grid,
  Search,
} from 'lucide-react';
import {
  Input,
} from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

interface PracticeHistoryFilterBarProps {
  selectedTypeFilter: string;
  setSelectedTypeFilter: (f: string) => void;
  selectedExamFilter: string;
  setSelectedExamFilter: (f: string) => void;
  selectedSkillFilter: string;
  setSelectedSkillFilter: (f: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeCategoryTab: string;
  setActiveCategoryTab: (tab: string) => void;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  sessionsCount: number;
  text: typeof CERTIFICATION_UI_TEXT.practiceHistory;
}

export const PracticeHistoryFilterBar = ({
  selectedTypeFilter,
  setSelectedTypeFilter,
  selectedExamFilter,
  setSelectedExamFilter,
  selectedSkillFilter,
  setSelectedSkillFilter,
  searchQuery,
  setSearchQuery,
  activeCategoryTab,
  setActiveCategoryTab,
  viewMode,
  setViewMode,
  sessionsCount,
  text,
}: PracticeHistoryFilterBarProps) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 border border-border rounded-xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={text.searchPlaceholder}
            className="pl-8 text-xs bg-background py-2 h-9 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={selectedExamFilter}
            onChange={(e) => setSelectedExamFilter(e.target.value)}
            className="bg-background border border-border text-xs font-bold text-foreground py-2 px-3 rounded-xl cursor-pointer h-9"
          >
            <option value="All">All Exams (IELTS, TOEIC...)</option>
            <option value="IELTS">IELTS</option>
            <option value="TOEIC">TOEIC</option>
            <option value="VSTEP">VSTEP</option>
          </select>

          <select
            value={selectedSkillFilter}
            onChange={(e) => setSelectedSkillFilter(e.target.value)}
            className="bg-background border border-border text-xs font-bold text-foreground py-2 px-3 rounded-xl cursor-pointer h-9"
          >
            <option value="All">All Skills</option>
            <option value="Listening">Listening</option>
            <option value="Reading">Reading</option>
            <option value="Speaking">Speaking</option>
            <option value="Writing">Writing</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-border pb-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          {[
            { id: 'All', label: `All (${sessionsCount})` },
            { id: 'Mock Tests', label: 'Mock Tests' },
            { id: 'Practice by Part', label: 'Practice by Part' },
            { id: 'Quizzes', label: 'Quizzes' },
            { id: 'AI Practices', label: 'AI Practices' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategoryTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold transition-all rounded-lg cursor-pointer whitespace-nowrap ${
                activeCategoryTab === tab.id
                  ? 'text-indigo-600 font-extrabold border-b-2 border-indigo-600 rounded-b-none'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl">
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
        </div>
      </div>
    </>
  );
};
