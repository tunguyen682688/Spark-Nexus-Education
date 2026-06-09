import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GrammarExamArenaContainer } from '../container/GrammarExamArenaContainer';

const GrammarExamArenaPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    navigate('/grammar/exams');
    return null;
  }

  return (
    <GrammarExamArenaContainer
      examId={id}
      onBack={() => navigate('/grammar/exams')}
    />
  );
};

export default GrammarExamArenaPage;
