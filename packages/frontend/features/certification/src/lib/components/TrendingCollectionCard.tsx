import React from 'react';
import { Star, Clock, Bookmark, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import type { ExamCollection } from '../types';

interface TrendingCollectionCardProps {
  item: ExamCollection;
}

export const TrendingCollectionCard: React.FC<TrendingCollectionCardProps> = ({ item }) => {
  return (
    <Card className={`border border-border hover:shadow-md transition-all duration-300 flex flex-col justify-between group overflow-hidden ${item.colorClass}`}>
      {/* Header Image section */}
      <div className="relative aspect-[1.4] w-full overflow-hidden">
        <img src={item.image} alt={item.title} className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Rank number badge (circle) */}
        {item.rank !== undefined && (
          <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-black text-xs shadow-md">
            {item.rank}
          </div>
        )}

        {/* Trend stats badge (green pill) */}
        {item.trend && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center gap-0.5 shadow-md">
            <ArrowUpRight className="w-3 h-3" />
            {item.trend}
          </div>
        )}

        {/* Exam classification tag */}
        <div className="absolute bottom-3 left-3">
          <Badge className={`${item.badgeColor} border-none text-[8px] font-black uppercase`}>
            {item.exam}
          </Badge>
        </div>
      </div>

      {/* Card content middle */}
      <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <h4 className="font-extrabold text-xs text-foreground line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h4>
          <p className="text-[9px] text-muted-foreground line-clamp-2 leading-relaxed">
            {item.desc}
          </p>
        </div>

        {/* Stars and learners count */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border pt-2">
          <span className="flex items-center gap-1 font-bold text-foreground">
            <Star className="w-3 h-3 text-amber-500 fill-current" />
            {item.rating}
            <span className="font-normal text-muted-foreground">({item.reviews})</span>
          </span>
          <span>{item.learners} learners</span>
        </div>

        {/* Grid stats (Mocks, Minis, Questions) */}
        <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl text-center text-[9px]">
          <div>
            <div className="font-black text-foreground">{item.mocks}</div>
            <div className="text-[7px] text-muted-foreground uppercase font-semibold">Mocks</div>
          </div>
          <div>
            <div className="font-black text-foreground">{item.minis}</div>
            <div className="text-[7px] text-muted-foreground uppercase font-semibold">Minis</div>
          </div>
          <div>
            <div className="font-black text-foreground">{item.questions}</div>
            <div className="text-[7px] text-muted-foreground uppercase font-semibold">Qs</div>
          </div>
        </div>

        {/* Level and Duration tags */}
        <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-0.5">
          <span className={`px-2 py-0.5 rounded font-bold ${item.levelColor}`}>
            {item.level}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {item.duration}
          </span>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-border mt-1">
          <Button className={`flex-1 text-xs py-3 rounded-lg font-bold flex items-center justify-center gap-1.5 ${item.btnColor}`}>
            Start Learning
          </Button>
          <button className="p-2 rounded-lg border border-border hover:bg-slate-50 dark:hover:bg-slate-800 text-muted-foreground">
            <Bookmark className="w-3.5 h-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
