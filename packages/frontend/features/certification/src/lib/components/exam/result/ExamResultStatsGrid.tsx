import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@spark-nest-ed/frontend-shared-components';

interface ExamResultStatsGridProps {
  correctCount?: number;
  incorrectCount?: number;
  accuracy?: string;
}

export function ExamResultStatsGrid({
  correctCount = 0,
  incorrectCount = 0,
  accuracy = '0%',
}: ExamResultStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-border">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-extrabold">{correctCount}</div>
            <div className="text-xs text-muted-foreground font-semibold">
              Correct Answers
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/30">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-extrabold">{incorrectCount}</div>
            <div className="text-xs text-muted-foreground font-semibold">
              Incorrect Answers
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-extrabold">{accuracy}</div>
            <div className="text-xs text-muted-foreground font-semibold">
              Accuracy Rate
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
