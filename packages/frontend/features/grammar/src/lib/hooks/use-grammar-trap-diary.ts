import { useState, useMemo, MouseEvent } from 'react';
import { toast } from 'sonner';
import { useGrammarTraps, useBreakGrammarTrap, useGenerateAiTrapAnalysis } from './use-grammar-traps';
import type { UserGrammarTrap, ExamQuestion } from '../types';

export function useGrammarTrapDiary() {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [activeStatus, setActiveStatus] = useState<string>('ALL');
  const [expandedTrapId, setExpandedTrapId] = useState<string | null>(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [drillQuestions, setDrillQuestions] = useState<ExamQuestion[]>([]);

  // React Query hooks for real database synchronization
  const { data: serverTraps = [], isLoading, refetch } = useGrammarTraps();
  const generateAiAnalysisMutation = useGenerateAiTrapAnalysis();
  const breakTrapMutation = useBreakGrammarTrap();

  // Filter traps using activeCategory and activeStatus
  const filteredTraps = useMemo(() => {
    return serverTraps.filter(trap => {
      const matchCategory = activeCategory === 'ALL' || trap.category === activeCategory;
      const matchStatus = activeStatus === 'ALL' || trap.status === activeStatus;
      return matchCategory && matchStatus;
    });
  }, [serverTraps, activeCategory, activeStatus]);

  const totalTrapped = useMemo(() => {
    return serverTraps.filter(t => t.status === 'TRAPPED').length;
  }, [serverTraps]);

  const totalBroken = useMemo(() => {
    return serverTraps.filter(t => t.status === 'BROKEN').length;
  }, [serverTraps]);

  const handleAiAnalysis = async (e: MouseEvent, trap: UserGrammarTrap) => {
    e.stopPropagation();
    if (trap.aiAnalysis) {
      setExpandedTrapId(expandedTrapId === trap.id ? null : trap.id);
      return;
    }

    const promise = generateAiAnalysisMutation.mutateAsync(trap.id);
    toast.promise(promise, {
      loading: 'Trợ lý AI đang giải mã bẫy ngữ pháp của bạn...',
      success: () => {
        setExpandedTrapId(trap.id);
        return 'Giải mã bẫy thành công! Hãy xem thần chú ghi nhớ bên dưới.';
      },
      error: 'Có lỗi xảy ra khi gọi Trợ lý AI.',
    });
  };

  const startTrapBreakerCampaign = () => {
    const trappedItems = serverTraps.filter(t => t.status === 'TRAPPED');
    if (trappedItems.length === 0) {
      toast.error('Tuyệt vời! Hiện tại bạn không còn bẫy ngữ pháp nào chưa phá.');
      return;
    }

    const mapped: ExamQuestion[] = trappedItems.map(t => {
      let qData = t.questionData;
      if (typeof qData === 'string') {
        try {
          qData = JSON.parse(qData);
        } catch {
          qData = {};
        }
      }
      const typedQData = qData as {
        options?: string[];
        words?: string[];
        sentence?: string;
        incorrectWord?: string;
        correctWord?: string;
      };
      return {
        id: t.questionId,
        text: t.questionText,
        type: t.questionType as ExamQuestion['type'],
        answer: t.correctAnswer,
        explanation: t.explanation,
        category: t.category as ExamQuestion['category'],
        options: typedQData?.options || [],
        words: typedQData?.words || [],
        sentence: typedQData?.sentence || '',
        incorrectWord: typedQData?.incorrectWord || '',
        correctWord: typedQData?.correctWord || '',
      };
    });

    setDrillQuestions(mapped);
    setIsPracticing(true);
    toast.success(`⚔️ Khởi động Chiến dịch Phá Bẫy với ${mapped.length} câu hỏi!`);
  };

  const handleFinishDrill = async (correctCount: number, totalCount: number) => {
    const trappedItems = serverTraps.filter(t => t.status === 'TRAPPED');
    const successRatio = totalCount > 0 ? correctCount / totalCount : 0;

    let brokenCount = 0;
    if (successRatio >= 0.8) {
      for (const item of trappedItems) {
        try {
          await breakTrapMutation.mutateAsync(item.id);
          brokenCount++;
        } catch (err) {
          console.error(err);
        }
      }
      toast.success(`🎉 Xuất sắc! Bạn đã phá vỡ thành công tất cả ${brokenCount} bẫy ngữ pháp và nhận thêm hàng loạt XP thưởng!`);
    } else if (correctCount > 0) {
      const itemsToBreak = trappedItems.slice(0, correctCount);
      for (const item of itemsToBreak) {
        try {
          await breakTrapMutation.mutateAsync(item.id);
          brokenCount++;
        } catch (err) {
          console.error(err);
        }
      }
      toast.success(`⚔️ Bạn đã phá vỡ thành công ${brokenCount} bẫy ngữ pháp! Hãy tiếp tục luyện tập để chinh phục các bẫy còn lại.`);
    } else {
      toast.error('Chiến dịch chưa thành công. Đừng nản chí, hãy phân tích kỹ giải nghĩa và thử lại nhé!');
    }

    refetch();
    setIsPracticing(false);
    return { success: true };
  };

  return {
    activeCategory,
    setActiveCategory,
    activeStatus,
    setActiveStatus,
    expandedTrapId,
    setExpandedTrapId,
    isPracticing,
    setIsPracticing,
    drillQuestions,
    filteredTraps,
    totalTrapped,
    totalBroken,
    isLoading,
    serverTraps,
    handleAiAnalysis,
    startTrapBreakerCampaign,
    handleFinishDrill,
  };
}
