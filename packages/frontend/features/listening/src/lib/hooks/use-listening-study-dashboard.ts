import { useParams, useNavigate } from 'react-router-dom';
import {
  useListeningMaterialDetail,
  useVoteListeningMaterial,
  useToggleListeningBookmark,
} from './index';
import { getDifficultyColor } from '../utils/listening-helpers';


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
