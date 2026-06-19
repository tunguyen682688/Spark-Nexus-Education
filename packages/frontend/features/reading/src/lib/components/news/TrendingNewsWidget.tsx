import React from 'react';
import { Skeleton } from '@spark-nest-ed/frontend-shared-components';
import { Sparkles, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_ARTICLE_THUMBNAIL } from '@spark-nest-ed/frontend-core-constants';
import { READING_UI_TEXT } from '../../constants';
import type { Article } from '../../types';

interface TrendingNewsWidgetProps {
  trendingArticles: Article[];
  isTrendingLoading: boolean;
}

export const TrendingNewsWidget: React.FC<TrendingNewsWidgetProps> = ({
  trendingArticles,
  isTrendingLoading,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4 transition-all duration-300 hover:shadow-md">
      <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-base">
        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" /> {READING_UI_TEXT.components.news.TRENDING_TITLE}
      </h4>
      {isTrendingLoading ? (
        Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-full h-3 rounded" />
                <Skeleton className="w-1/2 h-3 rounded" />
              </div>
            </div>
          ))
      ) : trendingArticles.length > 0 ? (
        <div className="space-y-3.5">
          {trendingArticles.map((item, index) => (
            <div
              key={item.id}
              onClick={() => navigate(`/reading/article/${item.id}`)}
              className="flex gap-3 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 relative shadow-sm border border-slate-100 dark:border-slate-800">
                <img
                  src={item.thumbnailUrl || DEFAULT_ARTICLE_THUMBNAIL}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_ARTICLE_THUMBNAIL;
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt={item.title}
                />
                <span className="absolute top-0.5 left-0.5 bg-slate-955/80 text-[8px] font-bold px-1.5 py-0.5 rounded-sm text-white backdrop-blur-sm">
                  #{index + 1}
                </span>
              </div>
              <div className="flex flex-col justify-center min-w-0 flex-1">
                <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h5>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-0.5 text-slate-400 dark:text-slate-500">
                    <Eye className="w-3 h-3" /> {item.viewCount || 0}
                  </span>
                  <span>•</span>
                  <span>{item.difficulty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">{READING_UI_TEXT.components.news.TRENDING_NO_NEWS}</p>
      )}
    </div>
  );
};
