import React from 'react';
import { useParams } from 'react-router-dom';
import { CertificationExamResultContainer } from '../container/CollectionDetail/CertificationExamResultContainer';

interface CertificationExamResultPageProps {
  resultId?: string;
  onRetake?: () => void;
  onBackToDashboard?: () => void;
}

export const CertificationExamResultPage: React.FC<
  CertificationExamResultPageProps
> = ({ resultId, onRetake, onBackToDashboard }) => {
  const params = useParams<{ id: string }>();
  const activeId = resultId || params.id || 'r1';

  return (
    <CertificationExamResultContainer
      resultId={activeId}
      onRetake={onRetake}
      onBackToDashboard={onBackToDashboard}
    />
  );
};
