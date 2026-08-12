import { Play, Clock, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import { ContentItem } from '../../hooks/container-logic/collection/use-collection-detail-container-logic';
import { ComingSoonSection } from '../shared/ComingSoonSection';

interface CollectionContentTabProps {
  contentItems: ContentItem[];
  itemsCount: number;
  isStartingExamSession: boolean;
  onStartLearning: (id: string) => void;
}

export const CollectionContentTab = ({
  contentItems,
  itemsCount,
  isStartingExamSession,
  onStartLearning,
}: CollectionContentTabProps) => {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base font-bold">
          Collection Items{itemsCount > 0 ? ` (${itemsCount})` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {contentItems.length === 0 ? (
          <ComingSoonSection
            title="No content items yet"
            description="The items in this collection will appear here once they are available from the server."
          />
        ) : (
          <div className="space-y-3 divide-y divide-border">
            {contentItems.map((item, idx) => (
              <div
                key={item.id ?? idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3 first:pt-0 gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {item.type}
                    </Badge>
                    <h4 className="font-extrabold text-xs text-foreground">
                      {item.title}
                    </h4>
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-3">
                    {item.duration != null && item.duration > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.duration} min
                      </span>
                    )}
                    {item.totalQuestions != null && item.totalQuestions > 0 && <span>&bull; {item.totalQuestions} questions</span>}
                  </div>
                </div>
                <Button
                  disabled={isStartingExamSession}
                  onClick={() => onStartLearning(item.id)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  {isStartingExamSession ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  Practice Now
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
