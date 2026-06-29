import type { FC } from 'react';
import { Check, ChevronRight } from 'lucide-react';

interface OutlineItem {
  id: string;
  label: string;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING';
}

interface OutlineTimelineProps {
  items: OutlineItem[];
  onClickItem?: (id: string) => void;
}

export const OutlineTimeline: FC<OutlineTimelineProps> = ({
  items = [],
  onClickItem,
}) => {
  return (
    <div className="relative pl-1 space-y-1">
      {/* Vẽ đường nối dọc mảnh đứt đoạn */}
      <div className="absolute left-[13px] top-4 bottom-4 w-[1.5px] bg-border border-l border-dashed border-border pointer-events-none" />

      {items.map((item) => {
        const isCompleted = item.status === 'COMPLETED';
        const isActive = item.status === 'ACTIVE';

        return (
          <div
            key={item.id}
            onClick={() => onClickItem && onClickItem(item.id)}
            className={`relative flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all cursor-pointer group ${
              isActive 
                ? 'bg-primary/5 text-primary border border-primary/10 shadow-inner' 
                : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-transparent'
            }`}
          >
            {/* Timeline Marker */}
            <div className="flex items-center gap-3.5 z-10">
              <span className={`h-5 w-5 rounded-full flex items-center justify-center border text-[9px] transition-all duration-300 ${
                isCompleted 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white' 
                  : isActive 
                    ? 'bg-primary/15 border-primary/30 text-primary shadow-md shadow-primary/20' 
                    : 'bg-muted border-border text-muted-foreground'
              }`}>
                {isCompleted ? (
                  <Check className="h-3 w-3 text-current stroke-[3px]" />
                ) : (
                  <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-primary animate-ping' : 'bg-muted-foreground/50'}`} />
                )}
              </span>
              <span className="transition-colors duration-200">{item.label}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Vòng nhỏ nhấp nháy ở bên phải cho active item */}
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              )}
              {isCompleted && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}
              {!isActive && !isCompleted && (
                <span className="h-1.5 w-1.5 rounded-full bg-border" />
              )}
              
              <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground/30 transition-all duration-200 ${
                isActive ? 'text-primary translate-x-0.5' : 'group-hover:text-muted-foreground group-hover:translate-x-0.5'
              }`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default OutlineTimeline;
