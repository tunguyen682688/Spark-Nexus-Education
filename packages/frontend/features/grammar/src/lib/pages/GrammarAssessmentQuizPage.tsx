import { useParams, useNavigate } from 'react-router-dom';
import { useGrammarLesson, useUpdateGrammarProgress } from '../hooks';
import GrammarAssessmentQuizContainer from '../container/GrammarAssessmentQuizContainer';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button, useToast } from '@spark-nest-ed/frontend-shared-components';

export const GrammarAssessmentQuizPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: lesson, isLoading, isError, refetch } = useGrammarLesson(id);
  const updateProgress = useUpdateGrammarProgress();

  const handleFinish = async (proficiency: number, xpEarned: number) => {
    if (id) {
      try {
        await updateProgress.mutateAsync({
          id,
          payload: {
            status: proficiency >= 80 ? 'MASTERED' : 'IN_PROGRESS',
            proficiency
          }
        });
        toast({
          title: 'Cập nhật tiến độ! 🎓',
          description: `Độ thông thạo bài học đạt ${proficiency}%. Nhận +${xpEarned} XP!`,
        });
        navigate('/grammar');
      } catch {
        toast({
          title: 'Lỗi đồng bộ',
          description: 'Không thể cập nhật tiến độ bài học lên đám mây.',
          variant: 'destructive'
        });
      }
    }
  };

  const handleBack = () => {
    if (id) {
      navigate(`/grammar/lessons/${id}`);
    } else {
      navigate('/grammar');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#03050d] text-slate-100 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400 tracking-wider animate-pulse">
          ĐANG TẢI BỘ ĐỀ ĐÁNH GIÁ...
        </p>
      </div>
    );
  }

  if (isError || !lesson) {
    return (
      <div className="min-h-screen bg-[#03050d] text-slate-100 flex flex-col items-center justify-center gap-4 px-4">
        <AlertTriangle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold">Không thể tải bộ đề đánh giá</h2>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/grammar')} variant="outline" className="border-slate-800 text-slate-400">
            Quay lại lộ trình
          </Button>
          <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-500 text-white font-bold border-none">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03050d] text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full">
        <GrammarAssessmentQuizContainer
          lessonTitle={lesson.title}
          lessonId={lesson.id}
          onFinish={handleFinish}
          onBack={handleBack}
        />
      </div>
    </div>
  );
};

export default GrammarAssessmentQuizPage;
