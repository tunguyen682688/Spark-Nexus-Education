import React from 'react';
import { useParams } from 'react-router-dom';
import { CertificationExamSessionContainer } from '../container';

interface CertificationExamSessionPageProps {
  sessionId?: string;
  onSubmitted?: (resultId: string) => void;
  onExit?: () => void;
}

export const CertificationExamSessionPage: React.FC<
  CertificationExamSessionPageProps
> = ({ sessionId, onSubmitted, onExit }) => {
  const params = useParams<{ id: string }>();
  const activeId = sessionId || params.id || 's1';

  return (
    <CertificationExamSessionContainer
      sessionId={activeId}
      onSubmitted={onSubmitted}
      onExit={onExit}
    />
  );
};
