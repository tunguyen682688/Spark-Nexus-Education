import type { ExamSectionContent, ExamSectionQuestion } from '../../../types/exam-content-editor.types';
import { TOEICQuestionEditor } from './TOEICQuestionEditor';

interface QuestionTypeAdapterProps {
  section: ExamSectionContent;
  question: ExamSectionQuestion;
  questionIndex: number;
  totalQuestions: number;
  onUpdate: (updates: Partial<ExamSectionQuestion>) => void;
  onUpdateGroupPassage: (passageText: string) => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
}

export function QuestionTypeAdapter({
  section,
  question,
  questionIndex,
  totalQuestions,
  onUpdate,
  onUpdateGroupPassage,
  onNavigatePrev,
  onNavigateNext,
}: QuestionTypeAdapterProps) {
  return (
    <TOEICQuestionEditor
      section={section}
      question={question}
      questionIndex={questionIndex}
      totalQuestions={totalQuestions}
      onUpdate={onUpdate}
      onUpdateGroupPassage={onUpdateGroupPassage}
      onNavigatePrev={onNavigatePrev}
      onNavigateNext={onNavigateNext}
    />
  );
}
