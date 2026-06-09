import { useNavigate } from 'react-router-dom';
import { GrammarUserProfileContainer } from '../container/GrammarUserProfileContainer';

export function GrammarUserProfilePage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <GrammarUserProfileContainer onBack={() => navigate('/grammar')} />
    </div>
  );
}
