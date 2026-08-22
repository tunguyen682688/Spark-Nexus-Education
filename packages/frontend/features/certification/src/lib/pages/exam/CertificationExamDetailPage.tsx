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
  const activeId = examId || params.id;

  if (!activeId) {
    return (
      <div className="w-full py-12 flex justify-center max-w-xl mx-auto">
        <p className="text-sm text-muted-foreground">No exam ID provided.</p>
      </div>
    );
  }

  return (
    <CertificationExamDetailContainer
      examId={activeId}
      onSessionStarted={onSessionStarted}
    />
  );
};
