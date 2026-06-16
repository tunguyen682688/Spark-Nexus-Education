import React from 'react';
import { Badge, Button } from '@spark-nest-ed/frontend-shared-components';
import { Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_ARTICLE_THUMBNAIL } from '@spark-nest-ed/frontend-core-constants';
import { READING_UI_TEXT } from '../../constants';
import type { Article } from '../../types';

interface NewsHeroCardProps {
  article: Article;
  onTagClick: (tag: string) => void;
}

export const NewsHeroCard: React.FC<NewsHeroCardProps> = ({ article, onTagClick }) => {
  const navigate = useNavigate();
  const isCompleted = article.progress >= 100;
  const isInProgress = article.progress > 0 && article.progress < 100;
  const progressBarColor = isCompleted ? 'bg-emerald-500' : 'bg-orange-500';

  return (
    <div 
      onClick={() => navigate(`/reading/article/${article.id}`)}
      className="col-span-1 md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/80 overflow-hidden flex flex-col md:flex-row cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group min-h-[350px]"
    >
      {/* Image side */}
      <div className="md:w-1/2 relative overflow-hidden h-64 md:h-auto min-h-[250px]">
        <img 
          src={article.thumbnailUrl || DEFAULT_ARTICLE_THUMBNAIL} 
          onError={(e) => { e.currentTarget.src = DEFAULT_ARTICLE_THUMBNAIL; }}
          alt={article.title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-103" 
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-red-600 text-white border-none font-bold text-[10px] px-2.5 py-1 uppercase tracking-wider shadow-sm">{READING_UI_TEXT.components.news.HERO_NEW}</Badge>
          <Badge className="bg-blue-600 text-white border-none font-bold text-[10px] px-2.5 py-1 shadow-sm">{article.difficulty}</Badge>
        </div>
      </div>
      {/* Content side */}
      <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{READING_UI_TEXT.components.news.HERO_LATEST_NEWS}</span>
            {article.tags && article.tags.length > 0 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick(article.tags[0]);
                }}
                className="text-[10px] font-bold text-slate-450 hover:text-blue-500 dark:hover:text-blue-400 uppercase tracking-widest transition-colors cursor-pointer"
              >
                • {article.tags[0]}
              </button>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {article.title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-4 leading-relaxed">
            {article.summary || article.content.substring(0, 200) + '...'}
          </p>
        </div>
        
        <div className="mt-6 space-y-4">
          {article.progress > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>{READING_UI_TEXT.components.news.HERO_PROGRESS}</span>
                <span className={isCompleted ? 'text-emerald-500' : 'text-orange-500'}>{article.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full ${progressBarColor}`} style={{ width: `${article.progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime || `${Math.ceil(article.wordCount / 200)} min read`}
            </div>
            <span>{article.author || 'Global News'}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-lg py-5 group-hover:bg-blue-600 border-none transition-colors">
              {isInProgress ? 'Continue Reading' : isCompleted ? 'Read Again' : 'Read Now'}
            </Button>
            <Button variant="outline" className="w-12 h-10 p-0 rounded-lg shrink-0">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
