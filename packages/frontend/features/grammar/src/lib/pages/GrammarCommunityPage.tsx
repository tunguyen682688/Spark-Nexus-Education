import { useNavigate } from 'react-router-dom';
import { GrammarCommunityContainer } from '../container/GrammarCommunityContainer';

export function GrammarCommunityPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/grammar');
  };

  const handleCreatePost = () => {
    navigate('/grammar/community/create');
  };

  return (
    <GrammarCommunityContainer 
      onBackToRoadmap={handleBack} 
      onNavigateToCreatePost={handleCreatePost} 
    />
  );
}

export default GrammarCommunityPage;
