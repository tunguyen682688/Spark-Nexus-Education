import React from 'react';
import { Card, CardContent, Button } from '@spark-nest-ed/frontend-shared-components';
import { History, BookOpen, ExternalLink } from 'lucide-react';
import { READING_UI_TEXT } from '../../constants';
import type { RecentLookupItem } from '../../types';
import { Link } from 'react-router-dom';

interface RecentLookupsProps {
  lookups: RecentLookupItem[];
  onViewFullHistory?: () => void;
}

export const RecentLookups: React.FC<RecentLookupsProps> = ({
  lookups,
  onViewFullHistory,
}) => {
  return (
    <Card className="border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden transition-colors">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-50 dark:border-slate-800 transition-colors">
          <History className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 tracking-tight transition-colors">{READING_UI_TEXT.components.dashboard.RECENT_LOOKUPS}</h3>
        </div>

        {/* Word list */}
        <div className="space-y-3">
          {lookups.length > 0 ? (
            lookups.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <div className="space-y-0.5 min-w-0">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate transition-colors">{item.word}</h4>
                  {item.pronunciation && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium font-sans transition-colors">
                      {item.pronunciation}
                    </p>
                  )}
                  {item.definition && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] leading-snug transition-colors">
                      {item.definition}
                    </p>
                  )}
                </div>
                
                {/* Dictionary Icon */}
                <Link
                  to={`/vocabularies/entry/${item.word}`}
                  className="h-7 w-7 rounded bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400 transition-colors flex-shrink-0"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 text-center rounded-lg transition-colors">
              <p className="text-slate-400 dark:text-slate-500 font-medium text-xs transition-colors">
                {READING_UI_TEXT.components.dashboard.NO_RECENT_LOOKUPS}
              </p>
            </div>
          )}
        </div>

        {/* View Full History Link */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 justify-center flex items-center gap-1 mt-1 transition-colors"
          onClick={onViewFullHistory}
          asChild
        >
          <Link to="/vocabularies/review">
            View Full History <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
