import { useNavigate } from 'react-router-dom';
import { GrammarLeaderboardContainer } from '../container/GrammarLeaderboardContainer';

export function GrammarLeaderboardPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[#03050d] text-slate-200">
      <GrammarLeaderboardContainer onBack={() => navigate('/grammar')} />
    </div>
  );
}
