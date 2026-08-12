import { Trophy, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import { CardSkeleton } from '../shared/LoadingSkeleton';
import { ErrorState } from '../shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import type { CertificationUIText } from '../../constants/certification.constants';

interface ExamHistoryPanelProps {
  items: Array<{
    id: string;
    title: string;
    scoreSub: string;
    scoreDisplay: string;
    dateDisplay: string;
    timeSpent: string;
  }>;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  onStartExam: (id: string, e?: React.MouseEvent) => void;
  text: CertificationUIText['library'];
}

export const ExamHistoryPanel = ({
  items,
  isLoading,
  isError,
  refetch,
  onStartExam,
  text,
}: ExamHistoryPanelProps) => {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" /> {text.historyTab.title}
        </CardTitle>
        <CardDescription>{text.historyTab.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : isError ? (
          <ErrorState onRetry={refetch} message={CERTIFICATION_UI_TEXT.error.practiceHistory} />
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl space-y-2">
            <Trophy className="w-8 h-8 mx-auto text-muted-foreground/40" />
            <p>Chưa có lịch sử thi</p>
            <p className="text-[11px]">Hoàn thành một bài thi để xem kết quả ở đây</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-4 border border-border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={item.scoreSub === 'Đạt' ? 'bg-emerald-500 text-white text-[10px]' : 'bg-red-500 text-white text-[10px]'}>
                    {item.scoreSub === 'Đạt' ? text.historyTab.completedBadge : 'Chưa đạt'}
                  </Badge>
                  <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-3">
                  <span>
                    Điểm: <strong className="text-emerald-600 dark:text-emerald-400">{item.scoreDisplay}</strong>
                  </span>
                  <span>&bull; {item.dateDisplay}</span>
                  <span>&bull; {item.timeSpent}</span>
                </p>
              </div>
              <Button
                onClick={() => onStartExam(item.id)}
                variant="outline"
                className="font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {text.historyTab.viewScorecardBtn}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
