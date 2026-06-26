import React from 'react';
import { BarChart3 } from 'lucide-react';

interface WeeklyDayData {
  day: string;
  min: number;
}

interface LibraryWeeklyChartProps {
  weeklyData: WeeklyDayData[];
}

export const LibraryWeeklyChart: React.FC<LibraryWeeklyChartProps> = ({ weeklyData }) => {
  const maxWeeklyMin = Math.max(...weeklyData.map((d) => d.min), 1);

  return (
    <div className="bg-card/40 border border-border rounded-3xl p-6 shadow-lg space-y-5">
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Hoạt động Tuần này (Phút)
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">Biểu đồ thời gian luyện nghe mỗi ngày</p>
      </div>

      <div className="flex items-end justify-between h-28 pt-4 px-2 border-b border-border/80">
        {weeklyData.map((d) => {
          const percentHeight = Math.max(5, Math.round((d.min / maxWeeklyMin) * 100));
          return (
            <div key={d.day} className="flex flex-col items-center gap-2 group cursor-pointer w-7">
              <div className="relative w-full flex justify-center">
                {d.min > 0 && (
                  <span className="absolute -top-6 text-[8px] font-bold text-primary bg-primary/10 border border-primary/20 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.min}m
                  </span>
                )}
                <div
                  className={`w-3.5 rounded-t-md transition-all duration-500 ${
                    d.min > 0 
                      ? 'bg-gradient-to-t from-primary to-primary/80 group-hover:from-primary/95 group-hover:to-primary/70 shadow-md shadow-primary/10'
                      : 'bg-muted'
                  }`}
                  style={{ height: `${percentHeight}px` }}
                />
              </div>
              <span className="text-[9px] text-muted-foreground font-bold">{d.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LibraryWeeklyChart;
