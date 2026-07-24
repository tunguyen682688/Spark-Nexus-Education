import React from 'react';
import { useParams } from 'react-router-dom';
import { CertificationCollectionDetailContainer } from '../container/CollectionDetail/CertificationCollectionDetailContainer';

interface CertificationCollectionDetailPageProps {
  collectionId?: string;
  onStartLearning?: (examId: string) => void;
}

export const CertificationCollectionDetailPage: React.FC<
  CertificationCollectionDetailPageProps
> = ({ collectionId, onStartLearning }) => {
  const params = useParams<{ id: string }>();
  const activeId = collectionId || params.id || 'c1';

  return (
    <CertificationCollectionDetailContainer
      collectionId={activeId}
      onStartLearning={onStartLearning}
    />
  );
};
