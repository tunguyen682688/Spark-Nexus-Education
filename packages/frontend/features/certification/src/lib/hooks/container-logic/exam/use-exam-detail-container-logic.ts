import { useNavigate } from 'react-router-dom';
import { useExamDetail, useStartExamSession } from '../../use-certification';

export function useExamDetailContainerLogic(examId: string, onSessionStarted?: (sessionId: string) => void) {
  const navigate = useNavigate();

  const { data: exam, isLoading, isError, error, refetch } = useExamDetail(examId);
  const { mutate: startExam, isPending: isStarting } = useStartExamSession();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/certification');
    }
  };

  const handleStartExam = () => {
    startExam(examId, {
      onSuccess: (session) => {
        if (onSessionStarted) {
          onSessionStarted(session.id);
        } else {
          navigate(`/certification/session/${session.id}`);
        }
      },
    });
  };

  return {
    exam,
    isLoading,
    isError,
    error,
    refetch,
    isStarting,
    handleBack,
    handleStartExam,
  };
}
