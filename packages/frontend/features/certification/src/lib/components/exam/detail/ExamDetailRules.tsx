import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@spark-nest-ed/frontend-shared-components';

export function ExamDetailRules() {
  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900/30">
      <CardContent className="p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h5 className="font-extrabold text-amber-900 dark:text-amber-300">
            Exam Proctoring & Anti-Cheat Rules
          </h5>
          <p className="text-amber-800 dark:text-amber-400">
            Do not switch browser tabs or leave full screen mode during the
            session. Unsaved answers will be autosaved in real time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
