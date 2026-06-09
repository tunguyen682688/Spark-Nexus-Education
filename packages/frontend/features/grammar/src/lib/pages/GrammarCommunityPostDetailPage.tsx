import { useNavigate, useParams } from 'react-router-dom';
import { GrammarCommunityPostDetailContainer } from '../container/GrammarCommunityPostDetailContainer';

export function GrammarCommunityPostDetailPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  
  if (!postId) return null;

  return (
    <div className="min-h-screen bg-[#03050d] text-slate-200">
      <GrammarCommunityPostDetailContainer 
        postId={postId}
        onBack={() => navigate('/grammar/community')} 
      />
    </div>
  );
}
