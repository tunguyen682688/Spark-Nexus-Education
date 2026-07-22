import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button, Card, CardContent } from '@spark-nest-ed/frontend-shared-components';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = 'Failed to load exam data. Please check your internet connection.',
  onRetry 
}) => {
  return (
    <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/10 p-6 rounded-2xl">
      <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-foreground">Something went wrong</h3>
          <p className="text-xs text-muted-foreground max-w-sm">{message}</p>
        </div>
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline" 
            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/20 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Request
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
