import React from 'react';
import { Award } from 'lucide-react';
import { CEFR_RANK_DETAILS } from '../constants';

interface LibraryMasteryCardProps {
  masteryLevel: string;
}

export const LibraryMasteryCard: React.FC<LibraryMasteryCardProps> = ({ masteryLevel }) => {
  const rank = CEFR_RANK_DETAILS[masteryLevel] || CEFR_RANK_DETAILS.unknown;

  return (
    <div className={`bg-gradient-to-br ${rank.colorClass} border rounded-3xl p-6 flex flex-col justify-between shadow-lg shadow-primary/5`}>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-80">Thứ Hạng Luyện Nghe</span>
          <Award className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-black">{rank.title}</h2>
        <p className="text-[11px] font-medium leading-relaxed opacity-90">{rank.desc}</p>
      </div>
      <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-4">
        <span className="text-[10px] font-bold">Spark Nexus Rank</span>
        <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 bg-black/35 rounded-lg">Mastery</span>
      </div>
    </div>
  );
};

export default LibraryMasteryCard;
