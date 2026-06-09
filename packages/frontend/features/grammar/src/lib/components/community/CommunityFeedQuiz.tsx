import { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, RefreshCw, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
// Removed unused imports
import type { GrammarBlock } from '../../types';

interface CommunityFeedQuizProps {
  postId: string;
  block: GrammarBlock;
}

interface FeedQuizState {
  selectedAnswer?: string;
  rebuiltWords?: string[];
  clickedWord?: string;
  correctedInput?: string;
  isCorrect?: boolean | null;
  isEvaluated?: boolean;
}

export function CommunityFeedQuiz({ postId, block }: CommunityFeedQuizProps) {
  const [quizState, setQuizState] = useState<FeedQuizState>({});

  const qType = block.quizType || 'MULTIPLE_CHOICE';
  const qQuestion = block.question || 'Chọn đáp án chính xác:';
  const qOptions = block.options || [];
  const qAnswer = block.answer || '';
  const qWords = block.words || [];
  const qSentence = block.sentence || '';
  const qIncorrect = block.incorrectWord || '';
  const qCorrect = block.correctWord || '';
  const qExplanation = block.explanation || '';

  const isEvaluated = !!quizState.isEvaluated;
  const isCorrect = quizState.isCorrect;

  const handleAnswerMultipleChoice = (selectedOption: string) => {
    const isAnsCorrect = selectedOption === qAnswer;
    setQuizState({
      selectedAnswer: selectedOption,
      isCorrect: isAnsCorrect,
      isEvaluated: true,
    });
    if (isAnsCorrect) {
      toast.success('Chính xác! +5 XP 🌟');
    } else {
      toast.error('Chưa chính xác! Xem giải thích bên dưới.');
    }
  };

  const handleWordClickFeed = (word: string) => {
    setQuizState((prev) => ({
      ...prev,
      rebuiltWords: [...(prev.rebuiltWords || []), word],
    }));
  };

  const handleRemoveWordFeed = (idx: number) => {
    setQuizState((prev) => ({
      ...prev,
      rebuiltWords: (prev.rebuiltWords || []).filter((_, i) => i !== idx),
    }));
  };

  const handleCheckSentenceFeed = () => {
    const assembled = (quizState.rebuiltWords || []).join(' ');
    const isAnsCorrect = assembled.toLowerCase().trim() === qAnswer.toLowerCase().trim();
    setQuizState((prev) => ({
      ...prev,
      isCorrect: isAnsCorrect,
      isEvaluated: true,
    }));
    if (isAnsCorrect) {
      toast.success('Chính xác! +5 XP 🌟');
    } else {
      toast.error('Chưa chính xác! Hãy đọc kỹ giải thích.');
    }
  };

  const handleWordClickSpotlightFeed = (word: string) => {
    const cleanWord = word.toLowerCase().replace(new RegExp('[.,/#!$%^&*;:{}=_`~()-]', 'g'), '');
    const isAnsCorrect = cleanWord === qIncorrect.toLowerCase();
    setQuizState((prev) => ({
      ...prev,
      clickedWord: word,
      isCorrect: isAnsCorrect ? null : false,
      isEvaluated: isAnsCorrect ? false : true,
    }));
    if (!isAnsCorrect) {
      toast.error('Chưa chính xác! Đó không phải là từ sai ngữ pháp.');
    } else {
      toast.success('Chính xác! Hãy nhập từ sửa lại đúng bên dưới để hoàn tất:');
    }
  };

  const handleCheckCorrectionFeed = () => {
    const input = (quizState.correctedInput || '').trim().toLowerCase();
    const isAnsCorrect = input === qCorrect.toLowerCase();
    setQuizState((prev) => ({
      ...prev,
      isCorrect: isAnsCorrect,
      isEvaluated: true,
    }));
    if (isAnsCorrect) {
      toast.success('Tuyệt vời! Sửa lỗi chính xác. +5 XP 🌟');
    } else {
      toast.error('Chưa chính xác! Từ sửa lại chưa đúng.');
    }
  };

  const handleResetFeedQuiz = () => {
    setQuizState({});
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="p-5 rounded-2xl bg-slate-950/60 border border-slate-900 space-y-4 shadow-inner relative"
    >
      <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
          <Sparkles className="h-4 w-4 fill-indigo-400/20" />
          Thử Thách Từ Cộng Đồng 🎯
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-950/60 border border-indigo-900 text-indigo-300">
          {qType === 'MULTIPLE_CHOICE'
            ? 'Trắc Nghiệm'
            : qType === 'SENTENCE_BUILDER'
            ? 'Sắp Xếp Câu'
            : 'Tìm Lỗi Sai'}
        </span>
      </div>

      <p className="text-xs font-semibold text-slate-250 bg-slate-900/40 px-3.5 py-2.5 rounded-xl border border-slate-900/60">
        {qQuestion}
      </p>

      {/* 1. Multiple Choice */}
      {qType === 'MULTIPLE_CHOICE' && (
        <div className="space-y-2">
          {qOptions.map((option: string, idx: number) => {
            const isOptionSelected = quizState.selectedAnswer === option;
            const isOptionCorrect = option === qAnswer;

            let btnStyle =
              'bg-slate-900/80 hover:bg-slate-850 border-slate-850 hover:border-slate-750 text-slate-300';
            let iconElement = null;

            if (isEvaluated) {
              if (isOptionSelected) {
                if (isCorrect) {
                  btnStyle =
                    'bg-emerald-950/40 border-emerald-500 text-emerald-250 shadow-md shadow-emerald-950/20';
                  iconElement = <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
                } else {
                  btnStyle =
                    'bg-red-950/40 border-red-500 text-red-250 shadow-md shadow-red-950/20';
                  iconElement = <XCircle className="h-4 w-4 text-red-400 shrink-0" />;
                }
              } else if (isOptionCorrect) {
                btnStyle = 'bg-emerald-950/20 border-emerald-600/50 text-emerald-300';
                iconElement = <CheckCircle2 className="h-4 w-4 text-emerald-500/80 shrink-0" />;
              } else {
                btnStyle = 'bg-slate-900/40 border-slate-900 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isEvaluated}
                onClick={() => handleAnswerMultipleChoice(option)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-medium transition-all duration-300 flex items-center justify-between gap-3 ${btnStyle}`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isEvaluated
                        ? isOptionSelected
                          ? isCorrect
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-red-500/20 text-red-300'
                          : isOptionCorrect
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-950 text-slate-650'
                        : 'bg-slate-955 text-slate-500'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </span>
                {iconElement}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Sentence Builder */}
      {qType === 'SENTENCE_BUILDER' && (
        <div className="space-y-3">
          <div className="min-h-12 bg-slate-900/50 rounded-xl border border-slate-850 p-3 flex flex-wrap gap-1.5 items-center">
            {!quizState.rebuiltWords || quizState.rebuiltWords.length === 0 ? (
              <span className="text-[10px] text-slate-500 italic">
                Click chọn các từ xáo trộn bên dưới để ghép câu...
              </span>
            ) : (
              quizState.rebuiltWords.map((word, idx) => (
                <button
                  key={idx}
                  disabled={isEvaluated}
                  onClick={() => handleRemoveWordFeed(idx)}
                  className="px-2.5 py-1 text-xs font-semibold bg-indigo-950/60 border border-indigo-850 text-indigo-305 rounded-lg hover:bg-red-950/50 hover:border-red-900 hover:text-red-300 transition"
                >
                  {word}
                </button>
              ))
            )}
          </div>

          {!isEvaluated && qWords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/20 rounded-xl border border-slate-900/60">
              {qWords.map((word: string, idx: number) => {
                const countInRebuilt =
                  quizState.rebuiltWords?.filter((w) => w === word).length || 0;
                const countInOriginal = qWords.filter((w: string) => w === word).length;
                const isUsed = countInRebuilt >= countInOriginal;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isUsed}
                    onClick={() => handleWordClickFeed(word)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                      isUsed
                        ? 'bg-slate-900/30 border-slate-900/50 text-slate-600 cursor-not-allowed opacity-30'
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            {isEvaluated ? (
              <button
                type="button"
                onClick={handleResetFeedQuiz}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Chơi Lại
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleResetFeedQuiz}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-400 text-xs font-bold transition"
                >
                  Làm sạch
                </button>
                <button
                  type="button"
                  disabled={!quizState.rebuiltWords || quizState.rebuiltWords.length === 0}
                  onClick={handleCheckSentenceFeed}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold disabled:opacity-40 transition shadow-md shadow-indigo-600/10"
                >
                  Kiểm Tra
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 3. Error Spotlight */}
      {qType === 'ERROR_SPOTLIGHT' && (
        <div className="space-y-3">
          <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl leading-loose flex flex-wrap gap-1.5">
            {qSentence?.split(' ').map((word: string, idx: number) => {
              const isWordClicked = quizState.clickedWord === word;

              let style = 'bg-slate-900/60 hover:bg-slate-850 border-slate-850 text-slate-300';
              if (isWordClicked) {
                if (isCorrect === true) {
                  style = 'bg-emerald-950/50 border-emerald-500 text-emerald-300';
                } else if (isCorrect === false) {
                  style = 'bg-red-950/50 border-red-500 text-red-300';
                } else {
                  style = 'bg-indigo-950 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-550/10';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isEvaluated}
                  onClick={() => handleWordClickSpotlightFeed(word)}
                  className={`px-2 py-0.5 rounded-md border text-xs font-medium transition duration-200 ${style}`}
                >
                  {word}
                </button>
              );
            })}
          </div>

          {quizState.clickedWord &&
            quizState.clickedWord.toLowerCase().replace(new RegExp('[.,/#!$%^&*;:{}=_`~()-]', 'g'), '') ===
              qIncorrect.toLowerCase() &&
            !isEvaluated && (
              <div className="p-3.5 bg-indigo-950/20 border border-indigo-950 rounded-xl space-y-2 animate-in fade-in-50 slide-in-from-top-1 duration-200">
                <label className="text-[10px] font-bold text-indigo-300 block">
                  Đã tìm đúng từ viết sai:{' '}
                  <span className="underline font-extrabold text-indigo-200">
                    "{quizState.clickedWord}"
                  </span>
                  . Hãy gõ từ sửa lại đúng ngữ pháp:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ví dụ: has"
                    value={quizState.correctedInput || ''}
                    onChange={(e) =>
                      setQuizState((prev) => ({ ...prev, correctedInput: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleCheckCorrectionFeed()}
                    className="flex-1 bg-slate-950 border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-1.5 text-xs text-slate-200 transition"
                  />
                  <button
                    type="button"
                    onClick={handleCheckCorrectionFeed}
                    className="bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition"
                  >
                    Xác Nhận
                  </button>
                </div>
              </div>
            )}

          {isEvaluated && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleResetFeedQuiz}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-350 text-xs font-bold transition flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Chơi Lại
              </button>
            </div>
          )}
        </div>
      )}

      {/* Phản hồi kết quả ĐÚNG / SAI chung */}
      {isEvaluated && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 ${
            isCorrect
              ? 'bg-emerald-950/30 border-emerald-800 text-emerald-250'
              : 'bg-red-950/30 border-red-800 text-red-250'
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <span className="text-xs font-bold block">
              {isCorrect
                ? 'Tuyệt vời! Bạn đã trả lời chính xác 🎉'
                : 'Rất tiếc, câu trả lời chưa chính xác.'}
            </span>

            {qType !== 'MULTIPLE_CHOICE' && (
              <p className="text-[10px] text-slate-300">
                Đáp án chính xác:{' '}
                <span className="font-semibold text-emerald-355">{qAnswer || qCorrect}</span>
              </p>
            )}

            {/* pedagogical explanation */}
            <div className="pt-2 border-t border-slate-900/60 mt-2 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Lightbulb className="h-3 w-3 text-yellow-400 fill-yellow-400/20" /> Giải thích lý
                thuyết sư phạm:
              </span>
              <p className="text-[11px] leading-relaxed text-slate-305">{qExplanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
