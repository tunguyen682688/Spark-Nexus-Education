import { useParams, useNavigate } from 'react-router-dom';
import {
  useListeningMaterialDetail,
  useVoteListeningMaterial,
  useToggleListeningBookmark,
} from './index';

export function useListeningStudyDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch material detail
  const {
    data: material,
    isLoading,
    error,
  } = useListeningMaterialDetail(id || '');

  const voteMutation = useVoteListeningMaterial();
  const toggleBookmarkMutation = useToggleListeningBookmark();
  const isBookmarked = material?.isBookmarked ?? false;

  const handleToggleBookmark = () => {
    if (!material) return;
    toggleBookmarkMutation.mutate(material.id);
  };

  const handleVote = (voteVal: number) => {
    if (!material) return;
    voteMutation.mutate({ id: material.id, vote: voteVal });
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'podcast':
        return 'Podcast';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Audio bài học';
      case 'exam':
        return 'Luyện thi chứng chỉ';
      default:
        return 'Tài liệu nghe';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'A1':
      case 'A2':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'B1':
      case 'B2':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'C1':
      case 'C2':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins} phút ${remainingSecs.toString().padStart(2, '0')} giây`;
  };

  return {
    id,
    navigate,
    material,
    isLoading,
    error,
    isBookmarked,
    handleToggleBookmark,
    handleVote,
    getCategoryLabel,
    getDifficultyColor,
    formatDuration,
  };
}
