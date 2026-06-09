import { useState, FormEvent } from 'react';
import { X, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { useSubmitCrowdsourcedQuiz } from '../../hooks';

interface CrowdsourcedQuizFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CrowdsourcedQuizForm({ isOpen, onClose }: CrowdsourcedQuizFormProps) {
  const [contribLessonId, setContribLessonId] = useState('relative-clauses');
  const [contribType, setContribType] = useState<'SENTENCE_BUILDER' | 'ERROR_SPOTLIGHT'>('SENTENCE_BUILDER');
  const [contribQuestion, setContribQuestion] = useState('');
  const [contribExplanation, setContribExplanation] = useState('');
  
  // Dành cho Sentence Builder
  const [wordsInput, setWordsInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  
  // Dành cho Error Spotlight
  const [sentenceInput, setSentenceInput] = useState('');
  const [incorrectWordInput, setIncorrectWordInput] = useState('');
  const [correctWordInput, setCorrectWordInput] = useState('');

  const submitQuizMutation = useSubmitCrowdsourcedQuiz();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contribQuestion || !contribExplanation) return;

    let questionData: any = {};
    if (contribType === 'SENTENCE_BUILDER') {
      questionData = {
        words: wordsInput.split(',').map(w => w.trim()).filter(Boolean),
        answer: answerInput.trim(),
      };
    } else {
      questionData = {
        sentence: sentenceInput.trim(),
        incorrectWord: incorrectWordInput.trim(),
        correctWord: correctWordInput.trim(),
      };
    }

    submitQuizMutation.mutate({
      lessonId: contribLessonId,
      payload: {
        questionType: contribType,
        questionData,
        explanation: contribExplanation,
      }
    }, {
      onSuccess: (res: any) => {
        toast.success(res?.message || 'Đóng góp thành công!');
        onClose();
        setContribQuestion('');
        setContribExplanation('');
        setWordsInput('');
        setAnswerInput('');
        setSentenceInput('');
        setIncorrectWordInput('');
        setCorrectWordInput('');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-6 flex items-center justify-between z-20">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-indigo-400" />
              Đóng Góp Câu Hỏi & Bài Tập
            </h2>
            <p className="text-xs text-slate-400 mt-1">Câu hỏi của bạn sẽ được hiển thị cho hàng ngàn học viên khác.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 text-slate-400 rounded-full transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Chọn Bài Học</label>
              <select
                value={contribLessonId}
                onChange={(e) => setContribLessonId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 transition"
              >
                <option value="relative-clauses">Mệnh đề quan hệ (Relative Clauses)</option>
                <option value="conditionals">Câu điều kiện (Conditionals)</option>
                <option value="passive-voice">Câu bị động (Passive Voice)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Loại Bài Tập</label>
              <select
                value={contribType}
                onChange={(e) => setContribType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 transition"
              >
                <option value="SENTENCE_BUILDER">Sắp xếp câu (Sentence Builder)</option>
                <option value="ERROR_SPOTLIGHT">Tìm & Sửa lỗi sai (Error Spotlight)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Yêu cầu đề bài (Question)</label>
            <input
              type="text"
              required
              value={contribQuestion}
              onChange={(e) => setContribQuestion(e.target.value)}
              placeholder="VD: Hãy sắp xếp các từ sau thành câu hoàn chỉnh"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 transition"
            />
          </div>

          {contribType === 'SENTENCE_BUILDER' && (
            <div className="space-y-4 p-4 bg-indigo-950/20 border border-indigo-900/50 rounded-2xl">
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Các từ khóa xáo trộn (Cách nhau bằng dấu phẩy)</label>
                <input
                  type="text"
                  required
                  value={wordsInput}
                  onChange={(e) => setWordsInput(e.target.value)}
                  placeholder="VD: The, man, who, is, standing, there, is, my, uncle"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Đáp án đúng (Câu hoàn chỉnh)</label>
                <input
                  type="text"
                  required
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder="VD: The man who is standing there is my uncle"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 transition"
                />
              </div>
            </div>
          )}

          {contribType === 'ERROR_SPOTLIGHT' && (
            <div className="space-y-4 p-4 bg-indigo-950/20 border border-indigo-900/50 rounded-2xl">
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Câu chứa lỗi sai (Sentence)</label>
                <input
                  type="text"
                  required
                  value={sentenceInput}
                  onChange={(e) => setSentenceInput(e.target.value)}
                  placeholder="VD: She have been working here for 5 years."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Từ viết sai</label>
                  <input
                    type="text"
                    required
                    value={incorrectWordInput}
                    onChange={(e) => setIncorrectWordInput(e.target.value)}
                    placeholder="VD: have"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Từ sửa lại đúng</label>
                  <input
                    type="text"
                    required
                    value={correctWordInput}
                    onChange={(e) => setCorrectWordInput(e.target.value)}
                    placeholder="VD: has"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex justify-between">
              Giải thích ngữ pháp (Sư phạm)
              <span className="text-[10px] text-slate-500 normal-case font-normal">Sẽ hiện ra khi học viên trả lời sai</span>
            </label>
            <textarea
              required
              rows={3}
              value={contribExplanation}
              onChange={(e) => setContribExplanation(e.target.value)}
              placeholder="Giải thích vì sao đáp án lại như vậy, áp dụng quy tắc ngữ pháp nào..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 transition resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitQuizMutation.isPending}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-550 disabled:opacity-50 transition shadow-lg shadow-indigo-500/20"
            >
              {submitQuizMutation.isPending ? 'Đang Gửi...' : 'Gửi Đóng Góp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
