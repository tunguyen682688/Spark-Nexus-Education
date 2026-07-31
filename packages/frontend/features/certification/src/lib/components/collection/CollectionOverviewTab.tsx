import { ArrowRight, FileText, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import { ContentItem, CollectionTabType } from '../../hooks/container-logic/collection/use-collection-detail-container-logic';
import { ComingSoonSection } from '../shared/ComingSoonSection';

interface CollectionOverviewTabProps {
  contentItems: ContentItem[];
  onSelectTab: (tab: CollectionTabType) => void;
}

export const CollectionOverviewTab = ({
  contentItems,
  onSelectTab,
}: CollectionOverviewTabProps) => {
  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold">
          What's Inside This Collection
        </CardTitle>
        {contentItems.length > 0 && (
          <Button
            onClick={() => onSelectTab('content')}
            variant="link"
            className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {contentItems.length === 0 ? (
          <ComingSoonSection
            title="Content list not available"
            description="The detailed content breakdown for this collection has not been published yet."
          />
        ) : (
          <div className="space-y-2">
            {contentItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-border flex items-center gap-3 hover:border-indigo-400 transition-colors"
              >
                <div className="p-2 rounded-lg text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex gap-2 mt-0.5">
                    {item.type && (
                      <Badge variant="secondary" className="text-[9px]">
                        {item.type}
                      </Badge>
                    )}
                    {item.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.duration}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
