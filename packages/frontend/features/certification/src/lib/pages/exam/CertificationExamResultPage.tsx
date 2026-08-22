import { useParams, useNavigate } from 'react-router-dom';
import { CertificationExamResultContainer } from '../../container/exam/CertificationExamResultContainer';

interface CertificationExamResultPageProps {
  resultId?: string;
}

export const CertificationExamResultPage = ({ resultId }: 
  CertificationExamResultPageProps
) => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activeId = resultId || params.id;

  if (!activeId) {
    return (
      <div className="w-full py-12 flex justify-center max-w-xl mx-auto">
        <p className="text-sm text-muted-foreground">No result ID provided.</p>
      </div>
    );
  }

  return (
    <CertificationExamResultContainer
      resultId={activeId}
      onRetake={() => navigate('/certification/exams')}
      onBackToDashboard={() => navigate('/certification')}
    />
  );
};
