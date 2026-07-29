import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button, Card, CardContent } from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ 
  title = CERTIFICATION_UI_TEXT.error.title,
  message = CERTIFICATION_UI_TEXT.error.defaultMessage,
  onRetry 
}: ErrorStateProps) => {
  return (
    <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/10 p-6 rounded-2xl my-6">
      <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground max-w-sm">{message}</p>
        </div>
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline" 
            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/20 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {CERTIFICATION_UI_TEXT.error.retryButton}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
