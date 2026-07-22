import React from 'react';
import { Star, Users, Clock, Heart, Bookmark } from 'lucide-react';
import { Card, CardContent, Badge } from '@spark-nest-ed/frontend-shared-components';
import type { ExamCollection } from '../types';

interface CommunityCollectionCardProps {
  item: ExamCollection;
}

export const CommunityCollectionCard: React.FC<CommunityCollectionCardProps> = ({ item }) => {
  return (
    <Card className="border-border hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      {/* Image top with badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <img src={item.image} alt={item.title} className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
        
        {item.tag && (
          <Badge className={`absolute top-3 left-3 text-[9px] font-black border-none ${item.tagColor}`}>
            {item.tag}
          </Badge>
        )}
        
        <button className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
          <Heart className="w-3.5 h-3.5 fill-current" />
        </button>

        <div className="absolute bottom-3 left-3">
          <Badge className="bg-indigo-600 text-white border-none text-[9px] font-black uppercase">
            {item.exam}
          </Badge>
        </div>
      </div>

      {/* Content middle */}
      <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <h4 className="font-extrabold text-xs text-foreground line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h4>
          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
            {item.desc}
          </p>
        </div>

        {/* Stars, downloads, time */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-2.5">
          <span className="flex items-center gap-1 font-bold text-foreground">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
            {item.rating}
            <span className="font-normal text-muted-foreground">({item.reviews})</span>
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {item.learners}
          </span>
        </div>

        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
          <span className={`px-2 py-0.5 rounded font-bold ${item.levelColor}`}>
            {item.level}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {item.duration}
          </span>
        </div>

        {/* Footer: Author details + bookmark button */}
        <div className="flex items-center justify-between border-t border-border pt-3 mt-1">
          <div className="flex items-center gap-2">
            <img src={item.avatar} alt={item.author} className="w-7 h-7 rounded-full object-cover border border-border" />
            <div>
              <div className="text-[10px] font-bold text-foreground leading-tight">{item.author}</div>
              <div className="text-[8px] text-muted-foreground">{item.authorRole}</div>
            </div>
          </div>
          <button className="p-1.5 rounded-lg border border-border hover:bg-slate-50 dark:hover:bg-slate-800 text-muted-foreground">
            <Bookmark className="w-3.5 h-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
