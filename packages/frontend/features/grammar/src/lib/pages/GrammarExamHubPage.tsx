import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { GrammarExamHubContainer } from '../container/GrammarExamHubContainer';

const GrammarExamHubPage: FC = () => {
  const navigate = useNavigate();

  return (
    <GrammarExamHubContainer
      onNavigateToExam={(id) => navigate(`/grammar/exams/${id}`)}
      onNavigateToCreator={() => navigate('/grammar/exams/create')}
    />
  );
};

export default GrammarExamHubPage;
