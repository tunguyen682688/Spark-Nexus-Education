import { useParams } from 'react-router-dom';
import { CertificationExamSessionContainer } from '../../container';

interface CertificationExamSessionPageProps {
  sessionId?: string;
  onSubmitted?: (resultId: string) => void;
  onExit?: () => void;
}

export const CertificationExamSessionPage = ({ sessionId, onSubmitted, onExit }: 
  CertificationExamSessionPageProps
) => {
  const params = useParams<{ id: string }>();
  const activeId = sessionId || params.id;

  return (
    <CertificationExamSessionContainer
      sessionId={activeId}
      onSubmitted={onSubmitted}
      onExit={onExit}
    />
  );
};
