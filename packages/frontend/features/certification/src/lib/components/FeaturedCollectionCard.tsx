import React from 'react';
import { Star, Users, Clock, Play, Bookmark, RefreshCw } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import type { ExamCollection } from '../types';

interface FeaturedCollectionCardProps {
  item: ExamCollection;
  onStart?: (id: string) => void;
  isStarting?: boolean;
}

export const FeaturedCollectionCard: React.FC<FeaturedCollectionCardProps> = ({ 
  item, 
  onStart,
  isStarting = false 
}) => {
  return (
    <Card className="hover:shadow-md transition-all duration-300 border-border group overflow-hidden flex flex-col justify-between h-full">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img src={item.image} alt={item.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        {item.tag && (
          <Badge className={`absolute top-3 left-3 text-[9px] font-black border-none ${item.tagColor}`}>
            {item.tag}
          </Badge>
        )}
        <button className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-colors">
          <Bookmark className="w-3.5 h-3.5 fill-current" />
        </button>
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <span className="text-[10px] text-blue-200 font-bold">{item.exam}</span>
          <h4 className="font-extrabold text-sm leading-tight mt-0.5">{item.title}</h4>
          <p className="text-[9px] text-slate-300 mt-1 font-light">{item.updated}</p>
        </div>
      </div>
      <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span className="font-bold text-foreground">{item.rating}</span>
            <span>({item.reviews})</span>
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{item.learners}</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl text-center">
          <div>
            <div className="text-xs font-black">{item.mocks}</div>
            <div className="text-[8px] text-muted-foreground uppercase font-semibold">Mocks</div>
          </div>
          <div>
            <div className="text-xs font-black">{item.minis}</div>
            <div className="text-[8px] text-muted-foreground uppercase font-semibold">Minis</div>
          </div>
          <div>
            <div className="text-xs font-black">{item.questions}</div>
            <div className="text-[8px] text-muted-foreground uppercase font-semibold">Ques</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] pt-1">
          <span className={`px-2 py-0.5 rounded font-bold ${item.levelColor}`}>
            {item.level}
          </span>
          <span className="text-muted-foreground flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {item.duration}
          </span>
        </div>

        <Button 
          disabled={isStarting}
          onClick={() => onStart && onStart(item.id)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl mt-2 flex items-center justify-center gap-2 group cursor-pointer"
        >
          {isStarting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current transition-transform group-hover:scale-110" />
          )}
          Xem bộ đề
        </Button>
      </CardContent>
    </Card>
  );
};
