import React from 'react';
import { Card, CardContent, Badge } from '@spark-nest-ed/frontend-shared-components';
import { Hash, TrendingUp } from 'lucide-react';
import { READING_UI_TEXT } from '../../constants';

interface TrendingTopicsProps {
  topics: string[];
  onTopicClick?: (topic: string) => void;
}

export const TrendingTopics: React.FC<TrendingTopicsProps> = ({
  topics,
  onTopicClick,
}) => {
  return (
    <Card className="border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden transition-colors">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-50 dark:border-slate-800 transition-colors">
          <TrendingUp className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 tracking-tight transition-colors">{READING_UI_TEXT.components.dashboard.TRENDING_TOPICS}</h3>
        </div>

        {/* Tags Grid */}
        <div className="flex flex-col gap-2">
          {topics.map((topic, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="w-fit cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-400 border border-slate-100/80 dark:border-slate-700/50 font-medium py-1.5 px-3 flex items-center gap-1.5 rounded transition-all duration-200"
              onClick={() => onTopicClick?.(topic)}
            >
              <Hash className="h-3 w-3 text-slate-400 dark:text-slate-500 transition-colors" />
              {topic}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
