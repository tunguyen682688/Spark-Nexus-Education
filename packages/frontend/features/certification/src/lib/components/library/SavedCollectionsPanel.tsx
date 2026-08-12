import { Bookmark, BookOpen, Play, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import { CardSkeleton } from '../shared/LoadingSkeleton';
import { ErrorState } from '../shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import type { CertificationUIText } from '../../constants/certification.constants';

interface SavedCollectionsPanelProps {
  collections: Array<{
    id: string;
    title: string;
    description?: string;
    subtitle?: string;
    exam: string;
    examCount?: number;
    itemsCount?: number;
    level?: string;
  }>;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  onOpenCollection: (id: string) => void;
  onStartExam: (id: string, e?: React.MouseEvent) => void;
  onUnbookmark: (id: string, e: React.MouseEvent) => void;
  onBackToDashboard: () => void;
  text: CertificationUIText['library'];
}

export const SavedCollectionsPanel = ({
  collections,
  isLoading,
  isError,
  refetch,
  onOpenCollection,
  onStartExam,
  onUnbookmark,
  onBackToDashboard,
  text,
}: SavedCollectionsPanelProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={refetch} message={CERTIFICATION_UI_TEXT.error.collections} />;
  }

  if (collections.length === 0) {
    return (
      <Card className="border-dashed p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <Bookmark className="w-12 h-12 text-muted-foreground/40" />
          <h3 className="text-base font-extrabold">{text.emptySaved.title}</h3>
          <p className="text-xs text-muted-foreground max-w-sm">{text.emptySaved.description}</p>
          <Button onClick={onBackToDashboard} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs mt-2 cursor-pointer">
            {text.emptySaved.exploreBtn}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <Card
          key={collection.id}
          onClick={() => onOpenCollection(collection.id)}
          className="border-border hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg cursor-pointer group flex flex-col justify-between"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <Badge variant="secondary" className="text-[10px] font-bold">
                {collection.exam}
              </Badge>
              <button
                onClick={(e) => onUnbookmark(collection.id, e)}
                title={text.card.unbookmarkTooltip}
                className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <CardTitle className="text-sm font-extrabold text-foreground group-hover:text-indigo-600 transition-colors line-clamp-2">
              {collection.title}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground line-clamp-2">
              {collection.description || collection.subtitle || text.card.defaultDesc}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50 pt-3">
              <span className="flex items-center gap-1 font-semibold">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                {collection.examCount || collection.itemsCount || 5} {text.card.mockTestsCount}
              </span>
              {collection.level && (
                <Badge variant="outline" className="text-[10px] font-semibold">
                  {collection.level}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={(e) => onStartExam(collection.id, e)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> {text.card.practiceBtn}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
