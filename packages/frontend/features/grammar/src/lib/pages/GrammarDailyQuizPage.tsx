import { useNavigate } from 'react-router-dom';
import GrammarDailyQuizContainer from '../container/GrammarDailyQuizContainer';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { useSubmitDailyQuiz, useDailyQuizQuestions } from '../hooks';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';

export const GrammarDailyQuizPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const submitDailyQuiz = useSubmitDailyQuiz();
  const { data: questions, isLoading, isError, refetch } = useDailyQuizQuestions();

  const handleFinish = async (score: number, xpEarned: number) => {
    try {
      await submitDailyQuiz.mutateAsync({ score, xpEarned });
      toast({
        title: 'Đã lưu điểm rèn luyện! 🎯',
        description: `Bạn trả lời đúng ${score} câu hỏi và nhận về +${xpEarned} XP thực tế!`,
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast({
        title: 'Lỗi đồng bộ rèn luyện',
        description: 'Không thể lưu tiến trình rèn luyện lên máy chủ.',
        variant: 'destructive',
      });
    }
    navigate('/grammar');
  };

  const handleBack = () => {
    navigate('/grammar');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#03050d] text-slate-100 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400 tracking-wider animate-pulse">
          ĐANG TẢI ĐỀ THI DAILY QUIZ...
        </p>
      </div>
    );
  }

  if (isError || !questions) {
    return (
      <div className="min-h-screen bg-[#03050d] text-slate-100 flex flex-col items-center justify-center gap-4 px-4">
        <AlertTriangle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold">Không thể tải đề thi Daily Quiz</h2>
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
        <GrammarDailyQuizContainer
          questions={questions as { id: string; text: string; options: string[]; answer: string; explanation: string }[]}
          onFinish={handleFinish}
          onBack={handleBack}
        />
      </div>
    </div>
  );
};

export default GrammarDailyQuizPage;
