import React from 'react';
import { Card, CardContent, Badge, Progress } from '@spark-nest-ed/frontend-shared-components';
import { Book, Play } from 'lucide-react';
import type { BookProgress } from '../../types';
import { READING_UI_TEXT } from '../../constants';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_ARTICLE_THUMBNAIL } from '@spark-nest-ed/frontend-core-constants';

interface BookNookProps {
  books: BookProgress[];
}

export const BookNook: React.FC<BookNookProps> = ({ books }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">{READING_UI_TEXT.components.dashboard.BOOK_NOOK}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {books.length > 0 ? (
          books.map((book) => (
            <Card
              key={book.id}
              className="group overflow-hidden border-slate-100 dark:border-slate-800 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer"
              onClick={() => navigate(`/reading/article/${book.id}`)}
            >
              <CardContent className="p-4 flex gap-4 items-center">
                {/* Cover Book Mockup with 3D Effect */}
                <div className="h-28 w-20 bg-blue-50 dark:bg-slate-800 rounded-sm rounded-r-md border-l-[4px] border-l-black/20 dark:border-l-black/40 shadow-[4px_4px_10px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.4)] flex items-center justify-center flex-shrink-0 relative transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-[1.02] group-hover:rotate-1">
                  {book.thumbnailUrl ? (
                    <>
                      <img
                        src={book.thumbnailUrl}
                        alt={book.title}
                        onError={(e) => { e.currentTarget.src = DEFAULT_ARTICLE_THUMBNAIL; }}
                        className="absolute inset-0 w-full h-full object-cover rounded-sm rounded-r-md"
                      />
                      {/* Spine shadow overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent w-full h-full rounded-sm rounded-r-md pointer-events-none" />
                    </>
                  ) : (
                    <Book className="h-8 w-8 text-blue-400 dark:text-blue-500" />
                  )}
                </div>

                {/* Book Info */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border-none font-bold text-[9px] uppercase px-1.5 py-0.5 rounded transition-colors shadow-sm">
                      A-Book
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {book.difficulty} Level
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base truncate leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{book.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate transition-colors">{book.author}</p>

                  {/* Progress */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 transition-colors">
                      <span className="flex items-center gap-1"><Book className="h-3 w-3" /> {book.chapterInfo}</span>
                      <span className="text-blue-600 dark:text-blue-400">{book.progress}%</span>
                    </div>
                    <Progress value={book.progress} className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-500 shadow-inner" />
                  </div>
                </div>

                {/* Action play button */}
                <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-500 group-hover:border-blue-500 group-hover:text-white shadow-sm transition-all duration-300">
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-1 sm:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 text-center rounded-xl transition-colors">
            <p className="text-slate-400 dark:text-slate-500 font-medium text-sm transition-colors">
              {READING_UI_TEXT.components.dashboard.NO_BOOK_NOOK}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
