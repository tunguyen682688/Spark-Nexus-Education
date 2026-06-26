import React from 'react';
import { Award } from 'lucide-react';
import { CEFR_LEVELS, LISTENING_LIBRARY_TEXT } from '../constants';

interface LibraryCEFRBreakdownCardProps {
  getCountByLevel: (lvl: string) => number;
}

export const LibraryCEFRBreakdownCard: React.FC<LibraryCEFRBreakdownCardProps> = ({
  getCountByLevel,
}) => {
  const text = LISTENING_LIBRARY_TEXT.LEVEL_BREAKDOWN;
  return (
    <div className="bg-card/40 border border-border rounded-3xl p-6 shadow-lg space-y-4">
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          {text.TITLE}
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">{text.SUBTITLE}</p>
      </div>

      <div className="space-y-2.5">
        {CEFR_LEVELS.map((lvl) => {
          const count = getCountByLevel(lvl);
          const maxCount = Math.max(...CEFR_LEVELS.map(l => getCountByLevel(l)), 1);
          const progressWidth = Math.round((count / maxCount) * 100);
          
          return (
            <div key={lvl} className="space-y-1 text-[11px] font-bold">
              <div className="flex justify-between text-muted-foreground">
                <span>{text.LEVEL_PREFIX}{lvl}</span>
                <span className="text-foreground font-black">{text.LESSONS_COUNT(count)}</span>
              </div>
              <div className="w-full h-1 bg-background rounded-full overflow-hidden border border-border">
                <div
                  className={`h-full transition-all duration-300 ${
                    lvl === 'A1' || lvl === 'A2'
                      ? 'bg-green-500'
                      : lvl === 'B1' || lvl === 'B2'
                      ? 'bg-blue-500'
                      : 'bg-purple-500'
                  }`}
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LibraryCEFRBreakdownCard;
