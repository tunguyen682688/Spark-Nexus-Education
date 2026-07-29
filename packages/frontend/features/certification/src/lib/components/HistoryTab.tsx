import type { QuestionVersion } from '../types';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

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
        <div className="text-sm text-gray-500">{text.loadingText}</div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">
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
              ? 'border-blue-200 bg-blue-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                index === 0
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {text.versionPrefix} {version.version}
              {index === 0 && ` ${text.currentLabel}`}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(version.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className="text-sm text-gray-700 line-clamp-3">
            {version.content}
          </p>
          {version.createdBy && (
            <p className="text-xs text-gray-500 mt-2">
              {text.byPrefix} {version.createdBy}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
