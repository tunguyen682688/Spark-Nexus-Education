import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import GrammarTrapDiaryContainer from '../container/GrammarTrapDiaryContainer';

const GrammarTrapDiaryPage: FC = () => {
  const navigate = useNavigate();

  return (
    <GrammarTrapDiaryContainer
      onNavigateBack={() => navigate('/grammar')}
    />
  );
};

export default GrammarTrapDiaryPage;
