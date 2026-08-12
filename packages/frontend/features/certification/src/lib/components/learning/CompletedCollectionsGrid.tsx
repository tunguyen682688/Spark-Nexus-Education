import { CheckCircle2, Grid, List } from 'lucide-react';
import { Card, Button } from '@spark-nest-ed/frontend-shared-components';
import type { CertificationUIText } from '../../constants/certification.constants';

interface CompletedCollectionsGridProps {
  collections: Array<{
    id: string;
    title: string;
    exam: string;
    score: number;
    completedDate: string;
  }>;
  viewMode: 'grid' | 'list';
  onOpenCollection: (id: string) => void;
  onViewCertificate: (id: string, e: React.MouseEvent) => void;
  onViewAnalytics: (id: string) => void;
  onBackToLearning: () => void;
  text: CertificationUIText['completedCollections'];
}

export const CompletedCollectionsGrid = ({
  collections,
  viewMode,
  onOpenCollection,
  onViewCertificate,
  onViewAnalytics,
  onBackToLearning,
  text,
}: CompletedCollectionsGridProps) => {
  if (collections.length === 0) {
    return (
      <Card className="border-border p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold text-base text-foreground">{text.emptyState.title}</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {text.emptyState.description}
          </p>
        </div>
        <Button onClick={onBackToLearning} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer">
          {text.emptyState.exploreBtn}
        </Button>
      </Card>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {collections.map((item) => (
          <CompletedCollectionCard
            key={item.id}
            item={item}
            onOpenCollection={onOpenCollection}
            onViewCertificate={(id, e) => onViewCertificate(id, e)}
            onViewAnalytics={onViewAnalytics}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {collections.map((item) => (
        <CompletedCollectionCard
          key={item.id}
          item={item}
          onOpenCollection={onOpenCollection}
          onViewCertificate={(id, e) => onViewCertificate(id, e)}
          onViewAnalytics={onViewAnalytics}
        />
      ))}
    </div>
  );
};