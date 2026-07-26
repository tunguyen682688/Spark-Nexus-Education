import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse border border-border bg-card rounded-2xl overflow-hidden flex flex-col justify-between aspect-[3/4] w-full p-4 space-y-4">
      <div className="bg-slate-200 dark:bg-slate-800 rounded-xl aspect-[16/10] w-full" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
      </div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
    </div>
  );
};

export const ListSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse border border-border bg-card rounded-2xl p-4 flex items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        </div>
      </div>
      <div className="w-20 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>
  );
};

export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full py-6">
      {Array.from({ length: count }).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </div>
  );
};
