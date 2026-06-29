import type { FC } from 'react';
import { useGrammarExamSets, useSubmitGrammarExamAttempt } from '../hooks';
import { SharedAssessmentEngineContainer } from './SharedAssessmentEngineContainer';
import { toast } from 'sonner';
import { GRAMMAR_UI_TEXT } from '../constants';

interface GrammarExamArenaContainerProps {
  examId: string;
  onBack: () => void;
}

export const GrammarExamArenaContainer: FC<GrammarExamArenaContainerProps> = ({
  examId,
  onBack
}) => {
  const { data: examSets = [], isLoading } = useGrammarExamSets();
  const submitAttemptMutation = useSubmitGrammarExamAttempt();

  const examSet = examSets.find((x) => x.id === examId);

  const handleFinishAttempt = async (correctCount: number, totalCount: number) => {
    try {
      const res = await submitAttemptMutation.mutateAsync({
        id: examId,
        correctCount,
        totalCount,
      });

      if (res.isPassed) {
        toast.success(GRAMMAR_UI_TEXT.examArena.toastPassSuccess.replace('{proficiency}', String(res.proficiency)));
        if (res.newCertificateIssued) {
          toast.success(GRAMMAR_UI_TEXT.examArena.toastCertSuccess);
        }
      } else {
        toast.error(GRAMMAR_UI_TEXT.examArena.toastFailed.replace('{proficiency}', String(res.proficiency)));
      }

      return res;
    } catch (err) {
      toast.error(GRAMMAR_UI_TEXT.examArena.toastSubmitError);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
          {GRAMMAR_UI_TEXT.examArena.loading}
        </div>
      </div>
    );
  }

  if (!examSet) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {GRAMMAR_UI_TEXT.examArena.notFound}
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {GRAMMAR_UI_TEXT.examArena.btnBack}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans py-10 px-4 sm:px-6 lg:px-8">
      <SharedAssessmentEngineContainer
        questions={examSet.questions}
        timeLimit={examSet.timeLimit}
        examType={examSet.examType}
        examTitle={examSet.title}
        onFinish={handleFinishAttempt}
        onBack={onBack}
      />
    </div>
  );
};
