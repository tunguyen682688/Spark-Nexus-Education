import React, { useState } from 'react';
import { Button, Card, CardContent } from '@spark-nest-ed/frontend-shared-components';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import type { Article } from '../../types';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_ARTICLE_THUMBNAIL } from '@spark-nest-ed/frontend-core-constants';

interface TrendingPublicationsProps {
  publications: Omit<Article, 'content' | 'summary'>[];
}

export const TrendingPublications: React.FC<TrendingPublicationsProps> = ({
  publications,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? publications.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === publications.length - 1 ? 0 : prev + 1));
  };

  if (publications.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Trending Publications</h2>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 text-center rounded-xl transition-colors">
          <p className="text-slate-400 dark:text-slate-500 font-medium text-sm transition-colors">
            No trending publications available at the moment.
          </p>
        </div>
      </div>
    );
  }

  // Show up to 3 publications at once, or dynamic viewport based on index
  const visiblePublications = [
    publications[currentIndex],
    publications[(currentIndex + 1) % publications.length],
    publications[(currentIndex + 2) % publications.length],
  ].slice(0, publications.length);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Trending Publications</h2>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visiblePublications.map((pub) => (
          <Card
            key={pub.id}
            className="group cursor-pointer overflow-hidden border-slate-100/80 dark:border-slate-800 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/10"
            onClick={() => navigate(`/reading/article/${pub.id}`)}
          >
            <div className="relative h-40 bg-slate-900 flex items-center justify-center p-4">
              {pub.thumbnailUrl ? (
                <>
                  <img
                    src={pub.thumbnailUrl}
                    alt={pub.title}
                    onError={(e) => { e.currentTarget.src = DEFAULT_ARTICLE_THUMBNAIL; }}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent pointer-events-none" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 opacity-90" />
              )}
              {pub.category === 'news' && (
                <div className="absolute top-3 left-3 bg-blue-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm border border-white/10">
                  News
                </div>
              )}
              <BookOpen className="text-white/30 h-10 w-10 relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:text-white/50" />
              {pub.author && (
                <div className="absolute bottom-3 left-4 text-white/90 text-xs truncate max-w-[80%] relative z-10 font-medium flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                    <span className="text-[8px] font-bold">{pub.author.charAt(0)}</span>
                  </div>
                  {pub.author}
                </div>
              )}
            </div>
            <CardContent className="p-4 space-y-2.5">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base line-clamp-2 min-h-[44px] leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {pub.title}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors">
                  {pub.readTime}
                </p>
                <div className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-sm">
                  {pub.difficulty} Level
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
