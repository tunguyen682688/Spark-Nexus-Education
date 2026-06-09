import { useParams, useNavigate } from 'react-router-dom';
import { useGrammarLesson, useCompleteGrammarLesson } from '../hooks';
import GrammarLessonDetailContainer from '../container/GrammarLessonDetailContainer';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button, useToast } from '@spark-nest-ed/frontend-shared-components';

export const GrammarLessonDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lesson, isLoading, isError, refetch } = useGrammarLesson(id);
  const completeLesson = useCompleteGrammarLesson();
  const { toast } = useToast();

  const handleComplete = async () => {
    if (id) {
      try {
        await completeLesson.mutateAsync(id);
        toast({
          title: 'Bài học hoàn thành! 🎉',
          description: 'Chúc mừng! Bạn đã hoàn thành xuất sắc bài học này và nhận thêm +50 XP!',
        });
        navigate('/grammar');
      } catch (err) {
        toast({
          title: 'Lỗi tiến trình',
          description: 'Có lỗi xảy ra khi cập nhật trạng thái bài học: ' + (err as Error).message,
          variant: 'destructive',
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#03050d] text-slate-100 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400 tracking-wider animate-pulse">
          ĐANG TẢI NỘI DUNG BÀI HỌC...
        </p>
      </div>
    );
  }

  if (isError || !lesson) {
    return (
      <div className="min-h-screen bg-[#03050d] text-slate-100 flex flex-col items-center justify-center gap-4 px-4">
        <AlertTriangle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold">Không thể tải nội dung bài học</h2>
        <p className="text-sm text-slate-400 max-w-md text-center">
          Không tìm thấy bài học ngữ pháp được yêu cầu hoặc đã xảy ra lỗi kết
          nối.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/grammar')}
            variant="outline"
            className="border-slate-800 text-slate-400 hover:text-slate-200"
          >
            Quay lại lộ trình
          </Button>
          <Button
            onClick={() => refetch()}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold border-none"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <GrammarLessonDetailContainer
      lesson={lesson}
      onComplete={handleComplete}
      isCompleting={completeLesson.isPending}
      onBackToRoadmap={() => navigate('/grammar')}
      onEditLesson={() => navigate(`/grammar/lessons/${lesson.id}/edit`)}
      onNavigateToLesson={(id) => navigate(`/grammar/lessons/${id}`)}
    />
  );
};

export default GrammarLessonDetailPage;
