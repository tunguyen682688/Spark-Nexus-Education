import { useParams } from 'react-router-dom';
import { CertificationExamResultContainer } from '../../container/exam/CertificationExamResultContainer';

interface CertificationExamResultPageProps {
  resultId?: string;
  onRetake?: () => void;
  onBackToDashboard?: () => void;
}

export const CertificationExamResultPage = ({ resultId, onRetake, onBackToDashboard }: 
  CertificationExamResultPageProps
) => {
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
