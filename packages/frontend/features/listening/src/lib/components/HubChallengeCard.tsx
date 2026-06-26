import React from 'react';
import { Calendar, PlayCircle } from 'lucide-react';
import { Card } from '@spark-nest-ed/frontend-shared-components';

interface ChallengeItem {
  id: string;
  title: string;
  description?: string | null;
  difficulty: string;
  duration: number;
}

interface HubChallengeCardProps {
  dailyChallengeItem: ChallengeItem;
  onClick: (id: string) => void;
}

export const HubChallengeCard: React.FC<HubChallengeCardProps> = ({
  dailyChallengeItem,
  onClick,
}) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card border border-border rounded-3xl p-6 shadow-xl space-y-4">
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-primary bg-primary/15 border border-primary/20 px-2.5 py-0.8 rounded-full">
          <Calendar className="w-3.5 h-3.5" />
          THỬ THÁCH HÀNG NGÀY
        </span>
        <span className="text-[10px] text-emerald-450 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
          +50 XP Thưởng
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-black text-foreground leading-snug">
          {dailyChallengeItem.title}
        </h3>
        <p className="text-[11px] text-muted-foreground line-clamp-2">
          {dailyChallengeItem.description || 'Hoàn thành bài tập chép chính tả hoặc nghe điền từ hôm nay để kích hoạt chuỗi Streak và nhận thưởng XP cực khủng.'}
        </p>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground py-3 border-y border-border/80">
        <span>Cấp độ: <b className="text-foreground">{dailyChallengeItem.difficulty}</b></span>
        <span>Thời lượng: <b className="text-foreground">{Math.round(dailyChallengeItem.duration / 60)} phút</b></span>
      </div>

      <button
        onClick={() => onClick(dailyChallengeItem.id)}
        className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-extrabold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md shadow-primary/15"
      >
        <PlayCircle className="w-4 h-4 fill-current" />
        LUYỆN TẬP NGAY
      </button>
    </Card>
  );
};

export default HubChallengeCard;
