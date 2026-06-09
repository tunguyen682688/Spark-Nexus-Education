import { FC, useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface QuizBlockProps {
  question: string;
  options: string[];
  answer: string;
  isEditable?: boolean;
  onChangeQuestion?: (question: string) => void;
  onChangeOptions?: (options: string[]) => void;
  onChangeAnswer?: (answer: string) => void;
}

export const QuizBlock: FC<QuizBlockProps> = ({
  question = '',
  options = [],
  answer = '',
  isEditable = false,
  onChangeQuestion,
  onChangeOptions,
  onChangeAnswer,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (!selectedOption) return;
    setSubmitted(true);
    const correct = selectedOption === answer;
    setIsCorrect(correct);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setIsCorrect(null);
  };

  const handleOptionChange = (idx: number, val: string) => {
    if (!isEditable || !onChangeOptions) return;
    const copy = [...options];
    copy[idx] = val;
    onChangeOptions(copy);
  };

  const handleAddOption = () => {
    if (!isEditable || !onChangeOptions) return;
    onChangeOptions([...options, '']);
  };

  const handleDeleteOption = (idx: number) => {
    if (!isEditable || !onChangeOptions) return;
    const copy = options.filter((_, i) => i !== idx);
    onChangeOptions(copy);
  };

  if (isEditable) {
    return (
      <div className="bg-[#070a14] border border-slate-900 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-450 uppercase tracking-wider">
          <HelpCircle className="h-4 w-4 text-blue-500" />
          Knowledge Check (Quiz Editor)
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400">Câu hỏi trắc nghiệm:</label>
          <textarea
            value={question}
            onChange={(e) => onChangeQuestion && onChangeQuestion(e.target.value)}
            className="w-full bg-[#0c1020]/45 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/70 focus:bg-[#0c1020]/75 transition-all resize-none placeholder-slate-655 shadow-inner"
            rows={3}
            placeholder="Nhập câu hỏi (Ví dụ: Complete the sentence: If I ___...)"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400">Các phương án trả lời:</label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                className="flex-1 bg-[#0c1020]/45 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-slate-200 outline-none focus:border-blue-500/70 focus:bg-[#0c1020]/75 transition-all placeholder-slate-650 shadow-inner"
                placeholder={`Lựa chọn ${idx + 1}`}
              />
              <button
                type="button"
                onClick={() => handleDeleteOption(idx)}
                className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs transition-colors border-none cursor-pointer"
                title="Xóa lựa chọn"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            className="text-[11px] font-bold text-blue-500 hover:text-blue-450 transition-colors bg-transparent border-none cursor-pointer"
          >
            + Thêm lựa chọn
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400">Đáp án chính xác:</label>
          <select
            value={answer}
            onChange={(e) => onChangeAnswer && onChangeAnswer(e.target.value)}
            className="w-full bg-[#0c1020]/45 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/70 focus:bg-[#0c1020]/75 transition-all cursor-pointer"
          >
            <option value="">Chọn đáp án đúng...</option>
            {options.filter(o => o.trim() !== '').map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#070a14] border border-slate-900 rounded-3xl p-6 shadow-xl space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 tracking-wider uppercase">
          <HelpCircle className="h-4 w-4 text-blue-500" />
          Knowledge Check
        </div>
        <span className="text-[9px] font-extrabold bg-[#0b1022] text-blue-400 border border-blue-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
          PRACTICE QUIZ
        </span>
      </div>

      {/* Question */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-200 whitespace-pre-wrap leading-relaxed">
          {question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((opt, idx) => {
          const isSelected = selectedOption === opt;
          let containerClass = "border-slate-900 bg-[#070a14] hover:bg-slate-900/30 hover:border-slate-800 text-slate-300";
          
          if (isSelected) {
            containerClass = "border-blue-500/80 bg-blue-500/5 text-blue-400 shadow-md shadow-blue-500/5";
          }
          
          if (submitted) {
            if (opt === answer) {
              containerClass = "border-emerald-500 bg-emerald-500/5 text-emerald-400 shadow-md shadow-emerald-500/5";
            } else if (isSelected && opt !== answer) {
              containerClass = "border-rose-500 bg-rose-500/5 text-rose-400 shadow-md shadow-rose-500/5";
            }
          }

          return (
            <div
              key={idx}
              onClick={() => !submitted && setSelectedOption(opt)}
              className={`flex items-center justify-between border rounded-2xl px-5 py-4 text-xs font-bold transition-all cursor-pointer ${containerClass}`}
            >
              <div className="flex items-center gap-3">
                {/* Custom radio button icon */}
                <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-500 text-white' 
                    : 'border-slate-800 bg-[#0c1020]'
                }`}>
                  {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <span>{opt}</span>
              </div>

              {/* Status Visual Mark */}
              {submitted && opt === answer && (
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              )}
              {submitted && isSelected && opt !== answer && (
                <XCircle className="h-4.5 w-4.5 text-rose-500" />
              )}
              {!submitted && isSelected && (
                <CheckCircle2 className="h-4.5 w-4.5 text-blue-500 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-900">
        <div>
          {submitted && isCorrect !== null && (
            <div className="flex items-center gap-1.5">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-500">Chính xác! Làm tốt lắm.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                  <span className="text-xs font-bold text-rose-500">Chưa chính xác. Thử lại nhé!</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {submitted && (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-xs font-bold"
            >
              Làm lại
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selectedOption || submitted}
            className={`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all border-none ${
              !selectedOption || submitted
                ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/15 active:scale-95'
            }`}
          >
            Submit Answer
          </button>
        </div>
      </div>

    </div>
  );
};
export default QuizBlock;
