import React from 'react';
import { Trophy, Rocket, Zap, Flame, Award } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

interface LibraryAchievementsGridProps {
  achievements: Achievement[];
}

export const LibraryAchievementsGrid: React.FC<LibraryAchievementsGridProps> = ({ achievements }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'first-step':
        return <Rocket className="w-5 h-5 text-primary" />;
      case 'listening-pro':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'streak-consistency':
        return <Flame className="w-5 h-5 text-orange-500 animate-pulse" />;
      case 'perfectionist':
        return <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />;
      default:
        return <Award className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="bg-card/40 border border-border rounded-3xl p-6 shadow-lg space-y-4">
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Huy Hiệu Học Tập
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">Mở khóa huy hiệu dựa trên nỗ lực của bạn</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {achievements.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-2xl border flex flex-col justify-between items-center text-center transition-all ${
              item.unlocked
                ? 'bg-background border-border text-foreground'
                : 'bg-muted/20 border-border/40 text-muted-foreground grayscale opacity-40'
            }`}
            title={item.description}
          >
            <div className="p-2 rounded-xl bg-muted/50 mb-2 border border-border">
              {getIcon(item.id)}
            </div>
            <span className="text-[10px] font-black">{item.title}</span>
            <span className="text-[8px] mt-0.5 leading-snug font-medium line-clamp-1">{item.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryAchievementsGrid;
