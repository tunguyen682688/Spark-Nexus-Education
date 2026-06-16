import React from 'react';
import { Card, CardContent, CardFooter, Badge, Button } from '@spark-nest-ed/frontend-shared-components';
import { Clock, Eye, Sparkles } from 'lucide-react';
import type { Article } from '../../types';
import { useNavigate } from 'react-router-dom';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { DEFAULT_ARTICLE_THUMBNAIL } from '@spark-nest-ed/frontend-core-constants';
import { READING_UI_TEXT } from '../../constants';

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const navigate = useNavigate();

  // Progress Bar styling based on status (mockup style: orange for in-progress, green for completed)
  const isCompleted = article.progress >= 100;
  const isInProgress = article.progress > 0 && article.progress < 100;
  
  const progressBarColor = isCompleted 
    ? 'bg-emerald-500' 
    : 'bg-orange-500';

  return (
    <Card className="overflow-hidden border-slate-100/80 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col h-full group">
      {/* Thumbnail Header */}
      <div className="relative h-44 bg-slate-900 flex items-center justify-center overflow-hidden flex-shrink-0">
        {article.thumbnailUrl ? (
          <img
            src={article.thumbnailUrl}
            alt={article.title}
            onError={(e) => { e.currentTarget.src = DEFAULT_ARTICLE_THUMBNAIL; }}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-slate-950 opacity-90" />
        )}

        {/* Custom badge: Contextual Vocab Ready */}
        <div className="absolute top-3 left-3 flex gap-1">
          <Badge className="bg-blue-600/90 text-white font-bold border-none text-[8px] uppercase tracking-wider flex items-center gap-1 py-1 px-2 rounded-sm backdrop-blur-sm shadow-sm">
            <Sparkles className="h-2.5 w-2.5 fill-current animate-pulse text-amber-300" />
            Contextual Vocab Ready
          </Badge>
        </div>

        {/* Difficulty level indicator inside circle bottom right of card header */}
        <div className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-slate-900/80 text-white border border-white/20 font-bold text-xs flex items-center justify-center backdrop-blur-sm">
          {article.difficulty}
        </div>
      </div>

      <CardContent className="p-4 flex-1 space-y-2.5 flex flex-col justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-blue-500 dark:text-blue-400 tracking-wider transition-colors">
            {article.category}
          </span>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-2 min-h-[44px] leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed transition-colors">
              {article.summary}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {/* Metadata Row */}
          <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider pt-2 border-t border-slate-50 dark:border-slate-800 transition-colors">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {article.readTime || `${Math.ceil(article.wordCount / 200)} min read`}
            </span>
            <span>
              {article.wordCount} words
            </span>
          </div>

          {/* Progress bar */}
          {article.progress > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 transition-colors">
                <span>{READING_UI_TEXT.components.shared.CARD_PROGRESS}</span>
                <span className={cn(isCompleted ? 'text-emerald-500 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400')}>
                  {article.progress}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden transition-colors">
                <div 
                  className={cn("h-full", progressBarColor)} 
                  style={{ width: `${article.progress}%` }} 
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full font-bold text-xs bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border-none transition-colors group-hover:bg-blue-600 dark:group-hover:bg-blue-500"
          onClick={() => navigate(`/reading/article/${article.id}`)}
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          {isInProgress ? 'Continue Reading' : isCompleted ? 'Read Again' : 'Begin Reading'}
        </Button>
      </CardFooter>
    </Card>
  );
};
