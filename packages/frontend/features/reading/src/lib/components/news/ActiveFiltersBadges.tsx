import React from 'react';
import { Badge } from '@spark-nest-ed/frontend-shared-components';
import { X } from 'lucide-react';
import { READING_UI_TEXT } from '../../constants';

interface ActiveFiltersBadgesProps {
  activeLevel: string;
  handleLevelChange: (val: string) => void;
  activeDomain: string;
  handleDomainChange: (val: string) => void;
  activeTime: string;
  handleTimeChange: (val: string) => void;
  handleQuickTagClick: (tag: string) => void;
}

export const ActiveFiltersBadges: React.FC<ActiveFiltersBadgesProps> = ({
  activeLevel,
  handleLevelChange,
  activeDomain,
  handleDomainChange,
  activeTime,
  handleTimeChange,
  handleQuickTagClick,
}) => {
  return (
    <div className="flex flex-wrap gap-2 items-center mb-8 text-xs">
      {/* Active CEFR Badge */}
      {activeLevel !== 'ALL' && (
        <Badge className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/50 dark:border-blue-800/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-none">
          CEFR: {activeLevel}
          <button 
            onClick={() => handleLevelChange('ALL')}
            className="hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full p-0.5 text-blue-500 hover:text-blue-700 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Active Domain Badge */}
      {activeDomain !== 'ALL' && (
        <Badge className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200/50 dark:border-indigo-800/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-none">
          Lĩnh vực: {activeDomain === 'technology' ? READING_UI_TEXT.news.DOMAIN_TECH : activeDomain === 'environment' ? READING_UI_TEXT.news.DOMAIN_ENV : activeDomain === 'science' ? READING_UI_TEXT.news.DOMAIN_SCI : activeDomain === 'business' ? READING_UI_TEXT.news.DOMAIN_BIZ : activeDomain === 'arts' ? READING_UI_TEXT.news.DOMAIN_ARTS : activeDomain === 'education' ? READING_UI_TEXT.news.DOMAIN_EDU : activeDomain === 'phonetics' ? READING_UI_TEXT.news.DOMAIN_PHONETICS : activeDomain === 'ai in education' ? READING_UI_TEXT.news.DOMAIN_AI : activeDomain === 'quantum computing' ? READING_UI_TEXT.news.DOMAIN_QUANTUM : activeDomain}
          <button 
            onClick={() => handleDomainChange('ALL')}
            className="hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-full p-0.5 text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Active Time Badge */}
      {activeTime !== 'ALL' && (
        <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200/50 dark:border-emerald-800/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-none">
          Thời gian: {activeTime === 'today' ? READING_UI_TEXT.news.TIME_TODAY : activeTime === 'week' ? READING_UI_TEXT.news.TIME_WEEK : READING_UI_TEXT.news.TIME_MONTH}
          <button 
            onClick={() => handleTimeChange('ALL')}
            className="hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-full p-0.5 text-emerald-500 hover:text-emerald-700 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Popular Quick-Tags */}
      {['Phonetics', 'AI in Education', 'Quantum Computing'].map((tag) => (
        <button
          key={tag}
          onClick={() => handleQuickTagClick(tag)}
          className="bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border border-slate-200/30 dark:border-slate-800/30 px-3 py-1.5 rounded-full transition-colors"
        >
          #{tag}
        </button>
      ))}
    </div>
  );
};
