import React from 'react';
import { Flame } from 'lucide-react';
import { LISTENING_LIBRARY_TEXT } from '../constants';

interface LibraryStreakCardProps {
  streak: number;
}

export const LibraryStreakCard: React.FC<LibraryStreakCardProps> = ({ streak }) => {
  const text = LISTENING_LIBRARY_TEXT.STREAK_CARD;
  return (
    <div className="bg-card/40 border border-border rounded-3xl p-6 flex flex-col justify-between shadow-lg">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
            {text.LABEL}
          </span>
          <Flame className="w-5 h-5 text-orange-500 animate-bounce" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-foreground">{streak}</span>
          <span className="text-xs font-bold text-muted-foreground">{text.STREAK_UNIT}</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed">
          {streak > 0 ? text.STREAK_ACTIVE : text.STREAK_INACTIVE}
        </p>
      </div>
      <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
        <span className="text-[10px] font-bold text-muted-foreground">{text.GOAL_LABEL}</span>
        <span className="text-xs font-bold text-foreground">{text.GOAL_VALUE}</span>
      </div>
    </div>
  );
};

export default LibraryStreakCard;
