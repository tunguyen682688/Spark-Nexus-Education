import { Clock, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import { CardSkeleton } from '../shared/LoadingSkeleton';
import { ErrorState } from '../shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import type { CertificationUIText } from '../../constants/certification.constants';

interface InProgressSessionsPanelProps {
  sessions: Array<{
    id: string;
    examId: string;
    title?: string;
    examTitle: string;
    timeAgo: string;
    totalQuestions: number;
  }>;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  onStartExam: (id: string, e?: React.MouseEvent) => void;
  text: CertificationUIText['library'];
}

export const InProgressSessionsPanel = ({
  sessions,
  isLoading,
  isError,
  refetch,
  onStartExam,
  text,
}: InProgressSessionsPanelProps) => {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" /> {text.inProgressTab.title}
        </CardTitle>
        <CardDescription>{text.inProgressTab.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : isError ? (
          <ErrorState onRetry={refetch} message={CERTIFICATION_UI_TEXT.error.practiceHistory} />
        ) : sessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl space-y-2">
            <Clock className="w-8 h-8 mx-auto text-muted-foreground/40" />
            <p>Không có phiên thi đang thực hiện</p>
            <p className="text-[11px]">Bắt đầu một bài thi để phiên hiện xuất hiện ở đây</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="p-4 border border-border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-secondary/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500 text-white text-[10px]">{text.inProgressTab.badge}</Badge>
                  <h4 className="font-bold text-sm text-foreground">{session.title || session.examTitle}</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  {session.timeAgo} &bull; {session.totalQuestions} câu hỏi
                </p>
              </div>
              <Button
                onClick={(e) => onStartExam(session.examId, e)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> {text.inProgressTab.resumeBtn}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
