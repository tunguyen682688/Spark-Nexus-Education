import type { QuestionVersion } from '../../types';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

interface HistoryTabProps {
  versions: QuestionVersion[];
  isLoading: boolean;
}

export const HistoryTab = ({
  versions,
  isLoading,
}: HistoryTabProps) => {
  const text = CERTIFICATION_UI_TEXT.historyTab;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-sm text-muted-foreground">{text.loadingText}</div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          {text.emptyState}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {versions.map((version, index) => (
        <div
          key={version.id}
          className={`p-4 rounded-lg border ${
            index === 0
              ? 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/30'
              : 'border-border bg-card'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                index === 0
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {text.versionPrefix} {version.version}
              {index === 0 && ` ${text.currentLabel}`}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(version.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className="text-sm text-foreground line-clamp-3">
            {version.content}
          </p>
          {version.createdBy && (
            <p className="text-xs text-muted-foreground mt-2">
              {text.byPrefix} {version.createdBy}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
