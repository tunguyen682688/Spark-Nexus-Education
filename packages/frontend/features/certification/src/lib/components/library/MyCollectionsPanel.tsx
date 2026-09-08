import { FolderOpen, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@spark-nest-ed/frontend-shared-components';
import { CardSkeleton } from '../shared/LoadingSkeleton';
import { ErrorState } from '../shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import type { CertificationUIText } from '../../constants/certification.constants';

interface MyCollectionsPanelProps {
  collections: Array<{
    id: string;
    title: string;
    description?: string;
    examCount?: number;
    itemCount?: number;
    publishStatus?: string;
  }>;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  onOpenCollection: (id: string) => void;
  text: CertificationUIText['library'];
}

export const MyCollectionsPanel = ({
  collections,
  isLoading,
  isError,
  refetch,
  onOpenCollection,
  text,
}: MyCollectionsPanelProps) => {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-indigo-500" /> {text.myCollectionsTab.title}
        </CardTitle>
        <CardDescription>{text.myCollectionsTab.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : isError ? (
          <ErrorState onRetry={refetch} message={CERTIFICATION_UI_TEXT.error.collections} />
        ) : collections.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl space-y-2">
            <FolderOpen className="w-8 h-8 mx-auto text-muted-foreground/40" />
            <p>{text.myCollectionsTab.emptyTitle}</p>
            <p className="text-[11px]">{text.myCollectionsTab.emptyDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((col) => (
              <Card
                key={col.id}
                onClick={() => onOpenCollection(col.id)}
                className="border-border hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg cursor-pointer group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-bold ${
                        col.publishStatus === 'published'
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}
                    >
                      {col.publishStatus === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-extrabold text-foreground group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {col.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                    {col.description || 'Chưa có mô tả'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50 pt-3">
                    <span className="flex items-center gap-1 font-semibold">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      {col.examCount ?? 0} đề thi
                    </span>
                    <span>{col.itemCount ?? 0} mục</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
