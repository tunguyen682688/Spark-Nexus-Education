import React from 'react';
import { Card, CardContent, Badge } from '@spark-nest-ed/frontend-shared-components';
import { Rss } from 'lucide-react';
import type { Article } from '../../types';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_ARTICLE_THUMBNAIL } from '@spark-nest-ed/frontend-core-constants';
import { READING_UI_TEXT } from '../../constants';

interface BlogosphereProps {
  articles: Omit<Article, 'content'>[];
}

export const Blogosphere: React.FC<BlogosphereProps> = ({ articles }) => {
  const navigate = useNavigate();

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      const hours = diffHours > 0 ? diffHours : 1;
      return READING_UI_TEXT.components.dashboard.TIME_HOURS_AGO.replace('{hours}', hours.toString());
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return READING_UI_TEXT.components.dashboard.TIME_YESTERDAY;
    return READING_UI_TEXT.components.dashboard.TIME_DAYS_AGO.replace('{days}', diffDays.toString());
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">{READING_UI_TEXT.components.dashboard.BLOGOSPHERE}</h2>
      <div className="grid grid-cols-1 gap-3">
        {articles.length > 0 ? (
          articles.map((art) => (
            <Card
              key={art.id}
              className="group overflow-hidden border-slate-100 dark:border-slate-800 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer"
              onClick={() => navigate(`/reading/article/${art.id}`)}
            >
              <CardContent className="p-4 flex gap-4 items-start">
                {/* Thumbnail or RSS Logo */}
                <div className="h-20 w-24 bg-blue-50 dark:bg-slate-800 rounded-md overflow-hidden flex-shrink-0 relative shadow-sm transition-shadow group-hover:shadow-md">
                  {art.thumbnailUrl ? (
                    <img 
                      src={art.thumbnailUrl} 
                      alt={art.title} 
                      onError={(e) => { e.currentTarget.src = DEFAULT_ARTICLE_THUMBNAIL; }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-500">
                      <Rss className="h-8 w-8 opacity-70" />
                    </div>
                  )}
                </div>

                {/* Feed Content */}
                <div className="flex-1 min-w-0 space-y-1.5 flex flex-col justify-center">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase transition-colors">
                    <div className="flex gap-2 items-center">
                      <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-500/10 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded transition-colors shadow-sm">
                        {art.difficulty}
                      </Badge>
                      <span className="text-slate-500 font-medium tracking-wider">{art.category}</span>
                    </div>
                    <span>{formatTimeAgo(art.createdAt)}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed transition-colors">
                    {art.summary}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 text-center rounded-xl transition-colors">
            <p className="text-slate-400 dark:text-slate-500 font-medium text-sm transition-colors">
              {READING_UI_TEXT.components.dashboard.NO_BLOGOSPHERE}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
