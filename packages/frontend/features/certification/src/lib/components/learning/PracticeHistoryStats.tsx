import {
  Clock,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Award,
} from 'lucide-react';
import {
  Card,
} from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

interface PracticeHistoryStatsProps {
  sessionsCount: number;
  text: typeof CERTIFICATION_UI_TEXT.practiceHistory;
}

export const PracticeHistoryStats = ({
  sessionsCount,
  text,
}: PracticeHistoryStatsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
      <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card">
        <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.metrics.totalSessions}
          </span>
          <div className="text-xl font-black text-foreground">{sessionsCount}</div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            {sessionsCount > 0 ? '+ Active' : '0 sessions'}
          </span>
        </div>
      </Card>

      <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card">
        <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.metrics.avgBandScore}
          </span>
          <div className="text-xl font-black text-foreground">7.5 / 9.0</div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center">
            Target gain
          </span>
        </div>
      </Card>

      <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card">
        <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.metrics.overallAccuracy}
          </span>
          <div className="text-xl font-black text-foreground">
            {sessionsCount > 0 ? '82.4%' : '0%'}
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">{sessionsCount} sessions</span>
        </div>
      </Card>

      <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card">
        <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.metrics.practiceTime}
          </span>
          <div className="text-xl font-black text-foreground">{sessionsCount * 15}m</div>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
            Logged practice
          </span>
        </div>
      </Card>

      <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card col-span-2 sm:col-span-1">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center flex-shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.metrics.bestSkill}
          </span>
          <div className="text-xl font-black text-foreground">Reading</div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
            Band 8.5
          </span>
        </div>
      </Card>
    </div>
  );
};
