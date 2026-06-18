import React from 'react';
import { Card, CardContent, CardFooter, Badge, Button } from '@spark-nest-ed/frontend-shared-components';
import { PenLine, Trash2, Loader2 } from 'lucide-react';
import type { Article } from '../../types';
import { useNavigate } from 'react-router-dom';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { DEFAULT_ARTICLE_THUMBNAIL, ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { READING_UI_TEXT } from '../../constants/reading-ui-text';

interface MyArticleCardProps {
  article: Article;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export const MyArticleCard: React.FC<MyArticleCardProps> = ({ 
  article,
  onDelete,
  isDeleting,
}) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden border-slate-100/80 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col h-full group">
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

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex gap-1">
          <Badge className={cn(
            "text-white font-bold border-none text-[8px] uppercase tracking-wider flex items-center py-1 px-2 rounded-sm backdrop-blur-sm shadow-sm",
            article.isPublished ? "bg-emerald-600/90" : "bg-orange-500/90"
          )}>
            {article.isPublished ? READING_UI_TEXT.myArticleCard.PUBLISHED : READING_UI_TEXT.myArticleCard.DRAFT}
          </Badge>
        </div>

        {/* Difficulty level */}
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
            <span>
              {READING_UI_TEXT.myArticleCard.LAST_UPDATED} {new Date(article.updatedAt).toLocaleDateString('vi-VN')}
            </span>
            <span>
              {article.wordCount} {READING_UI_TEXT.myArticleCard.WORDS}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          className="flex-1 font-bold text-xs bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border-none transition-colors group-hover:bg-blue-600 dark:group-hover:bg-blue-500"
          onClick={() => navigate(ROUTES.READING.STUDIO_EDIT.replace(':articleId', article.id))}
        >
          <PenLine className="h-3.5 w-3.5 mr-1.5" />
          {READING_UI_TEXT.myArticleCard.EDIT}
        </Button>
        {onDelete && (
          <Button
            variant="outline"
            size="icon"
            className="border-slate-200 text-slate-550 hover:text-red-600 hover:bg-red-50 dark:border-slate-800 dark:hover:bg-red-950/20 rounded-lg shrink-0 h-10 w-10 flex items-center justify-center transition-colors"
            onClick={() => onDelete(article.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            ) : (
              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-650" />
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
