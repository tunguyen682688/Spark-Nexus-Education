import { Star, Clock, Users, CheckCircle2, Bookmark, Play, RefreshCw } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import type { ExamCollection } from '../../types';

interface OfficialCollectionCardProps {
  item: ExamCollection;
  onStart?: (id: string) => void;
  isStarting?: boolean;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
}

export const OfficialCollectionCard = ({ 
  item,
  onStart,
  isStarting = false,
  onBookmark,
  isBookmarked = false,
}: OfficialCollectionCardProps) => {
  return (
    <Card className={`border border-border hover:shadow-md transition-all duration-300 flex flex-col justify-between group overflow-hidden h-full ${item.colorClass || ''}`}>
      <div className="relative aspect-[1.5] w-full overflow-hidden">
        <img src={item.image} alt={item.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
        
        <Badge className={`${item.badgeColor || 'bg-indigo-600 text-white'} border-none absolute top-3 left-3 text-[8px] font-black uppercase`}>
          {item.exam}
        </Badge>
        
        <Badge className="absolute top-3 right-3 bg-emerald-500 text-white border-none text-[8px] font-black uppercase flex items-center gap-0.5 shadow-md">
          <CheckCircle2 className="w-2.5 h-2.5 fill-current" />
          Official
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <h4 className="font-extrabold text-xs text-foreground line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h4>
        </div>

        {/* Rating and learners */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1 font-bold text-foreground">
            <Star className="w-3 h-3 text-amber-500 fill-current" />
            {item.rating}
            <span className="font-normal text-muted-foreground">({item.reviews})</span>
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {item.learners}
          </span>
        </div>

        {/* Grid metrics details */}
        <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl text-center text-[9px] font-bold">
          <div>
            <div className="text-foreground font-black">{item.mocks}</div>
            <div className="text-[7px] text-muted-foreground font-semibold uppercase">Mock Tests</div>
          </div>
          <div>
            <div className="text-foreground font-black">{item.minis}</div>
            <div className="text-[7px] text-muted-foreground font-semibold uppercase">Mini Tests</div>
          </div>
          <div>
            <div className="text-foreground font-black">{item.questions}</div>
            <div className="text-[7px] text-muted-foreground font-semibold uppercase">Questions</div>
          </div>
        </div>

        {/* Level & Duration */}
        <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-0.5">
          <span className={`px-2 py-0.5 rounded font-bold ${item.levelColor || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
            {item.level}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {item.duration}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-border mt-1">
          <Button 
            disabled={isStarting}
            onClick={() => onStart && onStart(item.id)}
            className={`flex-1 text-xs py-3 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer ${item.btnColor || 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
          >
            {isStarting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            Xem bộ đề chính thức
          </Button>
          <button 
            onClick={() => onBookmark && onBookmark(item.id)}
            className={`p-2.5 rounded-lg border border-border transition-colors ${
              isBookmarked 
                ? 'bg-amber-500 text-white border-amber-500' 
                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-muted-foreground'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
