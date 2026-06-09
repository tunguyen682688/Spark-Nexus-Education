import { useNavigate } from 'react-router-dom';
import { GrammarCreatePostContainer } from '../container/GrammarCreatePostContainer';

export function GrammarCreatePostPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/grammar/community');
  };

  return <GrammarCreatePostContainer onBackToCommunity={handleBack} />;
}

export default GrammarCreatePostPage;
