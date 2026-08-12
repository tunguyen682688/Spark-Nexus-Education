import { useMemo } from 'react';
import { useGrammarLesson } from '../use-grammar-lessons';
import { useCrowdsourcedQuizzes } from '../use-grammar-community';
import type { ExamQuestion, GrammarBlock } from '../../types';

interface UseQuestionBankParams {
  lessonId: string;
}

interface UseQuestionBankReturn {
  questions: ExamQuestion[];
  isLoading: boolean;
}

export function useQuestionBank({ lessonId }: UseQuestionBankParams): UseQuestionBankReturn {
  const { data: lesson, isLoading: isLessonLoading } = useGrammarLesson(lessonId);
  const { data: crowdsourcedQuizzes, isLoading: isCrowdsourcedLoading } = useCrowdsourcedQuizzes(lessonId);

  const questions = useMemo(() => {
    const list: ExamQuestion[] = [];

    if (lesson?.blocks && Array.isArray(lesson.blocks)) {
      lesson.blocks.forEach((block: GrammarBlock) => {
        if (block.type === 'quiz') {
          list.push({
            id: block.id,
            text: block.question || '',
            type: 'MULTIPLE_CHOICE',
            options: block.options || [],
            answer: block.answer || '',
            explanation: block.explanation || 'Hãy chọn đáp án đúng nhất.',
            category: 'syntax',
          });
        }
      });
    }

    if (crowdsourcedQuizzes && Array.isArray(crowdsourcedQuizzes)) {
      crowdsourcedQuizzes
        .filter((quiz) => quiz.status === 'APPROVED')
        .forEach((quiz) => {
          const type = quiz.questionType;
          const data = quiz.questionData;
          list.push({
            id: quiz.id,
            type: type,
            text: type === 'MULTIPLE_CHOICE'
              ? (data.text || data.question || 'Hãy chọn đáp án đúng nhất:')
              : type === 'SENTENCE_BUILDER'
              ? 'Hãy click chọn các từ để sắp xếp thành câu hoàn chỉnh:'
              : 'Tìm từ viết sai ngữ pháp trong câu dưới đây (click chọn từ sai) và nhập từ sửa lại đúng:',
            options: data.options || [],
            answer: data.answer || '',
            explanation: quiz.explanation || 'Đáp án do cộng đồng đóng góp.',
            category: 'syntax',
            words: data.words || [],
            sentence: data.sentence || '',
            incorrectWord: data.incorrectWord || '',
            correctWord: data.correctWord || '',
          });
        });
    }

    return list;
  }, [lesson, crowdsourcedQuizzes]);

  return {
    questions,
    isLoading: isLessonLoading || isCrowdsourcedLoading,
  };
}
