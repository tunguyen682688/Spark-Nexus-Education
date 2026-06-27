import React from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import { Card } from '@spark-nest-ed/frontend-shared-components';
import { ListeningLeaderboardEntry } from '../types';

interface HubLeaderboardProps {
  selectedDifficulty: string;
  displayTotalMinutes: number;
  leaderboardData?: ListeningLeaderboardEntry[];
  isLoading?: boolean;
}

const getInitials = (name: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const HubLeaderboard: React.FC<HubLeaderboardProps> = ({
  selectedDifficulty,
  displayTotalMinutes,
  leaderboardData,
  isLoading,
}) => {
  return (
    <Card className="bg-card border border-border rounded-3xl p-6 backdrop-blur-md space-y-5">
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4 text-orange-400" />
          Bảng Xếp Hạng Luyện Nghe Tuần
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">Top 5 học viên tích cực nhất</p>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground animate-pulse">
              Đang tải xếp hạng...
            </p>
          </div>
        ) : !leaderboardData || leaderboardData.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground font-medium">
            Chưa có dữ liệu xếp hạng tuần.
          </div>
        ) : (
          leaderboardData.map((entry, index) => {
            const rank = index + 1;
            const isTop1 = rank === 1;
            const isTop2 = rank === 2;
            const isTop3 = rank === 3;
            const minutes = Math.round(entry.totalTime / 60);

            let rankIcon: React.ReactNode = rank;
            let bgGradient = "from-slate-750 to-slate-900";
            const borderClass = "border-border";

            if (isTop1) {
              rankIcon = <span role="img" aria-label="gold medal">🥇</span>;
              bgGradient = "from-yellow-500 to-amber-600";
            } else if (isTop2) {
              rankIcon = <span role="img" aria-label="silver medal">🥈</span>;
              bgGradient = "from-slate-400 to-slate-650";
            } else if (isTop3) {
              rankIcon = <span role="img" aria-label="bronze medal">🥉</span>;
              bgGradient = "from-amber-600 to-amber-900";
            }

            return (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-2.5 rounded-xl bg-background/30 border transition-colors ${borderClass}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center text-xs font-bold text-muted-foreground">
                    {rankIcon}
                  </span>
                  {entry.userPicture ? (
                    <img
                      src={entry.userPicture}
                      alt={entry.userName}
                      className="w-7 h-7 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${bgGradient} text-[10px] font-black text-white flex items-center justify-center uppercase shadow-inner`}>
                      {getInitials(entry.userName)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-[11px] font-extrabold text-foreground leading-tight">
                      {entry.userName}
                    </h4>
                    <span className="text-[9px] text-muted-foreground font-semibold">
                      Cấp độ: {entry.masteryLevel}
                    </span>
                  </div>
                </div>
                <span className={`text-[11px] font-black ${isTop1 ? 'text-yellow-500' : isTop2 ? 'text-muted-foreground' : isTop3 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                  {minutes} phút
                </span>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default HubLeaderboard;
