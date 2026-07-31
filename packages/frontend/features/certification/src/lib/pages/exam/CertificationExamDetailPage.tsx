import { useParams } from 'react-router-dom';
import { CertificationExamDetailContainer } from '../../container';

interface CertificationExamDetailPageProps {
  examId?: string;
  onSessionStarted?: (sessionId: string) => void;
}

export const CertificationExamDetailPage = ({ examId, onSessionStarted }: 
  CertificationExamDetailPageProps
) => {
  const params = useParams<{ id: string }>();
  const activeId = examId || params.id || 'e1';

  return (
    <CertificationExamDetailContainer
      examId={activeId}
      onSessionStarted={onSessionStarted}
    />
  );
};
