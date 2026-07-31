import { useFeaturedCollections } from '../../hooks/use-certification';
import { FeaturedCollectionCard } from '../exam/FeaturedCollectionCard';
import { CardSkeleton } from '../shared/LoadingSkeleton';
import { ComingSoonSection } from '../shared/ComingSoonSection';

interface CollectionRelatedTabProps {
  onStartRelatedCollectionExam: (relatedCollectionId: string) => void;
  isStartingExamSession: boolean;
}

export const CollectionRelatedTab = ({
  onStartRelatedCollectionExam,
  isStartingExamSession,
}: CollectionRelatedTabProps) => {
  const { data: relatedCollections = [], isLoading: isLoadingRelated } =
    useFeaturedCollections();

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold tracking-tight">
        Recommended Related Collections
      </h3>
      {isLoadingRelated ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : relatedCollections.length === 0 ? (
        <ComingSoonSection
          title="No related collections found"
          description="Related collections from the same exam category will be suggested here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {relatedCollections.slice(0, 4).map((item) => (
            <FeaturedCollectionCard
              key={item.id}
              item={item}
              onStart={onStartRelatedCollectionExam}
              isStarting={isStartingExamSession}
            />
          ))}
        </div>
      )}
    </div>
  );
};
