import { useParams, useNavigate } from 'react-router-dom';
import GrammarLevelGraduationContainer from '../container/GrammarLevelGraduationContainer';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { useSubmitLevelGraduation } from '../hooks';

export const GrammarLevelGraduationPage = () => {
  const { level } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const submitGraduation = useSubmitLevelGraduation();

  const handleFinish = async (score: number, isPassed: boolean) => {
    if (level) {
      try {
        const percentage = score * 10; // 10 questions total, each 10%
        await submitGraduation.mutateAsync({ level, percentage });

        if (isPassed) {
          toast({
            title: 'Chúc mừng tốt nghiệp! 🎓🌟',
            description: `Bạn đã vượt qua bài thi tốt nghiệp CEFR ${level} với điểm số ${percentage}% thực tế!`,
          });
        } else {
          toast({
            title: 'Chưa đủ điểm tốt nghiệp ⚠️',
            description: `Kết quả thi đạt ${percentage}%. Cần tối thiểu 80% để được phê duyệt tốt nghiệp.`,
            variant: 'destructive',
          });
        }
      } catch {
        toast({
          title: 'Lỗi lưu kết quả thi',
          description: 'Không thể cập nhật trạng thái thi tốt nghiệp lên máy chủ.',
          variant: 'destructive',
        });
      }
    }
    navigate('/grammar');
  };

  const handleBack = () => {
    navigate('/grammar');
  };

  return (
    <div className="min-h-screen bg-[#03050d] text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full">
        <GrammarLevelGraduationContainer
          level={level || 'A1'}
          onFinish={handleFinish}
          onBack={handleBack}
        />
      </div>
    </div>
  );
};

export default GrammarLevelGraduationPage;
