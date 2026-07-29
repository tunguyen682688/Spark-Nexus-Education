import { useParams } from 'react-router-dom';
import { CertificationCollectionDetailContainer } from '../container/CollectionDetail/CertificationCollectionDetailContainer';

interface CertificationCollectionDetailPageProps {
  collectionId?: string;
  onStartLearning?: (examId: string) => void;
}

export const CertificationCollectionDetailPage = ({ collectionId, onStartLearning }: 
  CertificationCollectionDetailPageProps
) => {
  const params = useParams<{ id: string }>();
  const activeId = collectionId || params.id || 'c1';

  return (
    <CertificationCollectionDetailContainer
      collectionId={activeId}
      onStartLearning={onStartLearning}
    />
  );
};
