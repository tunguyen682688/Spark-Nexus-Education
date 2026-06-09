import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { GrammarExamCreatorContainer } from '../container/GrammarExamCreatorContainer';

const GrammarExamCreatorPage: FC = () => {
  const navigate = useNavigate();

  return (
    <GrammarExamCreatorContainer
      onSuccess={() => navigate('/grammar/exams')}
      onCancel={() => navigate('/grammar/exams')}
    />
  );
};

export default GrammarExamCreatorPage;
