import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { GrammarPracticeHubContainer } from '../container/GrammarPracticeHubContainer';

export const GrammarPracticeHubPage: FC = () => {
  const navigate = useNavigate();

  const handleBackToRoadmap = () => {
    navigate('/grammar');
  };

  return <GrammarPracticeHubContainer onBackToRoadmap={handleBackToRoadmap} />;
};

export default GrammarPracticeHubPage;
