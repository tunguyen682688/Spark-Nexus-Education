import { useState, FormEvent } from 'react';
import { useCreateGrammarExamSet } from './use-grammar-exams';
import { toast } from 'sonner';
import type { ExamQuestion } from '../types';

interface UseGrammarExamCreatorProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function useGrammarExamCreator({ onSuccess, onCancel }: UseGrammarExamCreatorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('ALL');
  const [examType, setExamType] = useState<'CEFR' | 'TOEIC' | 'IELTS' | 'VSTEP'>('TOEIC');
  const [timeLimitMins, setTimeLimitMins] = useState(10);
  const [questions, setQuestions] = useState<Partial<ExamQuestion>[]>([
    {
      id: `q-${Math.random().toString(36).substring(2, 9)}`,
      type: 'MULTIPLE_CHOICE',
      text: '',
      category: 'syntax',
      explanation: '',
      options: ['', '', '', ''],
      answer: '',
    },
  ]);

  const createMutation = useCreateGrammarExamSet();

  // Thêm câu hỏi mới
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q-${Math.random().toString(36).substring(2, 9)}`,
        type: 'MULTIPLE_CHOICE',
        text: '',
        category: 'syntax',
        explanation: '',
        options: ['', '', '', ''],
        answer: '',
      },
    ]);
  };

  // Xóa câu hỏi
  const handleRemoveQuestion = (idx: number) => {
    if (questions.length === 1) {
      toast.warning('Bộ đề thi phải có ít nhất một câu hỏi.');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // Cập nhật trường câu hỏi chung
  const handleUpdateQuestion = (idx: number, fields: Partial<ExamQuestion>) => {
    setQuestions(
      questions.map((q, i) => (i === idx ? { ...q, ...fields } : q))
    );
  };

  // Cập nhật Option Trắc nghiệm
  const handleUpdateOption = (qIdx: number, optIdx: number, val: string) => {
    const q = questions[qIdx];
    if (!q.options) return;
    const newOpts = [...q.options];
    newOpts[optIdx] = val;
    handleUpdateQuestion(qIdx, { options: newOpts });
  };

  // Gửi đóng góp bộ đề thi
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và mô tả bộ đề thi.');
      return;
    }

    // Kiểm tra tính hợp lệ của từng câu hỏi
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text?.trim()) {
        toast.error(`Vui lòng điền nội dung câu hỏi số ${i + 1}.`);
        return;
      }
      if (!q.explanation?.trim()) {
        toast.error(`Vui lòng nhập giải thích đáp án cho câu hỏi số ${i + 1}.`);
        return;
      }

      if (q.type === 'MULTIPLE_CHOICE') {
        if (!q.options || q.options.some((opt) => !opt.trim())) {
          toast.error(
            `Vui lòng điền đầy đủ 4 đáp án lựa chọn cho câu hỏi số ${i + 1}.`
          );
          return;
        }
        if (!q.answer?.trim()) {
          toast.error(
            `Vui lòng điền đáp án chính xác cho câu hỏi số ${i + 1}.`
          );
          return;
        }
      } else if (q.type === 'SENTENCE_BUILDER') {
        if (
          !q.words ||
          q.words.length === 0 ||
          q.words.some((w) => !w.trim())
        ) {
          toast.error(
            `Vui lòng nhập danh sách từ xáo trộn cho câu hỏi số ${
              i + 1
            }. Nhập các từ ngăn cách bằng dấu phẩy.`
          );
          return;
        }
        if (!q.answer?.trim()) {
          toast.error(
            `Vui lòng nhập câu đáp án hoàn chỉnh cho câu hỏi số ${i + 1}.`
          );
          return;
        }
      } else if (q.type === 'ERROR_SPOTLIGHT') {
        if (!q.sentence?.trim()) {
          toast.error(
            `Vui lòng nhập câu văn đầy đủ chứa lỗi sai cho câu hỏi số ${i + 1}.`
          );
          return;
        }
        if (!q.incorrectWord?.trim() || !q.correctWord?.trim()) {
          toast.error(
            `Vui lòng chỉ định từ bị viết sai và từ sửa lại đúng cho câu hỏi số ${
              i + 1
            }.`
          );
          return;
        }
      }
    }

    try {
      await createMutation.mutateAsync({
        title,
        description,
        level,
        examType,
        timeLimit: timeLimitMins * 60,
        questions: questions as ExamQuestion[],
      });
      toast.success(
        'Đóng góp bộ đề thi thành công! Bộ đề của bạn đã được tự động duyệt xuất bản.'
      );
      onSuccess();
    } catch {
      toast.error('Có lỗi xảy ra trong quá trình xuất bản bộ đề.');
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    level,
    setLevel,
    examType,
    setExamType,
    timeLimitMins,
    setTimeLimitMins,
    questions,
    createMutation,
    handleAddQuestion,
    handleRemoveQuestion,
    handleUpdateQuestion,
    handleUpdateOption,
    handleSubmit,
  };
}
