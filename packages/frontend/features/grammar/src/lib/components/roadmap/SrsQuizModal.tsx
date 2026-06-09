import { useState, useEffect } from 'react';
import { X, Check, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { useSrsDueQuizzes, useSubmitSrsFeedback } from '../../hooks';
import type { ExamQuestion } from '../../types';

interface SrsQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SrsQuizModal({ isOpen, onClose }: SrsQuizModalProps) {
  const [srsQuizzesList, setSrsQuizzesList] = useState<ExamQuestion[]>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [selectedErrorWord, setSelectedErrorWord] = useState<string | null>(null);
  const [correctedText, setCorrectedText] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [totalXpEarned, setTotalXpEarned] = useState(0);

  const { data: srsQuizzes, isLoading: loadingSrs } = useSrsDueQuizzes();
  const submitSrsMutation = useSubmitSrsFeedback();

  useEffect(() => {
    if (isOpen) {
      const list = (srsQuizzes || []) as ExamQuestion[];
      setSrsQuizzesList(list);
      setCurrentQuizIdx(0);
      setSelectedWords([]);
      setSelectedErrorWord(null);
      setCorrectedText('');
      setIsAnswered(false);
      setIsCorrect(null);
      setSessionScore(0);
      setIsSessionFinished(false);
      setTotalXpEarned(0);
    }
  }, [isOpen, srsQuizzes]);

  // Load and shuffle words if SENTENCE_BUILDER
  useEffect(() => {
    if (srsQuizzesList.length > 0 && currentQuizIdx < srsQuizzesList.length) {
      const q = srsQuizzesList[currentQuizIdx];
      const qType = q?.type || 'MULTIPLE_CHOICE';
      if (qType === 'SENTENCE_BUILDER' && q.words) {
        setShuffledWords([...q.words].sort(() => Math.random() - 0.5));
      }
    }
  }, [currentQuizIdx, srsQuizzesList]);

  const handleWordClick = (word: string) => {
    if (isAnswered) return;
    setSelectedWords([...selectedWords, word]);
  };

  const handleRemoveWord = (wordIndex: number) => {
    if (isAnswered) return;
    setSelectedWords(selectedWords.filter((_, idx) => idx !== wordIndex));
  };

  const handleClearWords = () => {
    if (isAnswered) return;
    setSelectedWords([]);
  };

  const handleCheckSentenceBuilder = () => {
    if (isAnswered) return;
    const currentQuestion = srsQuizzesList[currentQuizIdx];
    if (!currentQuestion) return;

    const rawAnswer = selectedWords.join(' ').replace(/\s+/g, ' ').trim();
    const cleanAnswer = rawAnswer.replace(/\s+([.,!?;])/g, '$1');
    const correct = cleanAnswer.toLowerCase() === currentQuestion.answer.toLowerCase();

    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setSessionScore((prev) => prev + 1);
      setTotalXpEarned((prev) => prev + 10);
    } else {
      setTotalXpEarned((prev) => prev + 2);
    }

    submitSrsMutation.mutate({ quizId: currentQuestion.id, isCorrect: correct });
  };

  const handleSelectErrorWord = (word: string) => {
    if (isAnswered) return;
    const cleanWord = word.replace(/[.,!?;]/g, '');
    setSelectedErrorWord(cleanWord);
  };

  const handleCheckErrorSpotlight = () => {
    if (isAnswered || !selectedErrorWord || !correctedText) return;
    const currentQuestion = srsQuizzesList[currentQuizIdx];
    if (!currentQuestion) return;

    const isTargetCorrect = selectedErrorWord.toLowerCase() === currentQuestion.incorrectWord?.toLowerCase();
    const isCorrectionCorrect = correctedText.trim().toLowerCase() === currentQuestion.correctWord?.toLowerCase();

    const correct = isTargetCorrect && isCorrectionCorrect;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setSessionScore((prev) => prev + 1);
      setTotalXpEarned((prev) => prev + 10);
    } else {
      setTotalXpEarned((prev) => prev + 2);
    }

    submitSrsMutation.mutate({ quizId: currentQuestion.id, isCorrect: correct });
  };

  const handleNextSrs = () => {
    if (currentQuizIdx < srsQuizzesList.length - 1) {
      setCurrentQuizIdx((prev) => prev + 1);
      setSelectedWords([]);
      setSelectedErrorWord(null);
      setCorrectedText('');
      setIsAnswered(false);
      setIsCorrect(null);
    } else {
      setIsSessionFinished(true);
    }
  };

  if (!isOpen) return null;

  const currentSrsQuestion = srsQuizzesList[currentQuizIdx];
  const currentSrsType = currentSrsQuestion?.type || 'SENTENCE_BUILDER';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div className="absolute inset-0 bg-[#020308]/85 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#070a14] border border-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto animate-scaleUp">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-indigo-600/5 blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-slate-900 pb-4 relative z-10">
          <div className="flex items-center gap-2">
            <span role="img" aria-label="brain">🧠</span>
            <div>
              <h3 className="text-base font-extrabold text-white">Luyện Tập Lặp Lại Ngắt Quãng</h3>
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Spaced Repetition System (SRS)</span>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#0c1020] border border-slate-850 text-slate-450 hover:text-slate-200 transition-colors cursor-pointer hover:scale-105 active:scale-95 border-none">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative z-10 space-y-6">
          {loadingSrs ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-slate-400">
              <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
              <span className="text-xs font-bold">Đang tải kho câu hỏi ôn tập...</span>
            </div>
          ) : srsQuizzesList.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center text-3xl animate-bounce">
                <span role="img" aria-label="success-party">🎉</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-white">Bạn đã hoàn tất mọi mục tiêu!</h4>
                <p className="text-xs text-slate-450 max-w-sm leading-relaxed">
                  Hiện tại không có câu hỏi nào đến hạn ôn tập. Hãy quay lại sau khi hệ thống tự động tính toán thời gian lặp lại tối ưu cho bạn!
                </p>
              </div>
              <Button onClick={onClose} className="bg-slate-900 border border-slate-800 text-slate-300 font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer hover:bg-slate-850 active:scale-95">
                Trở Lại Lộ Trình
              </Button>
            </div>
          ) : isSessionFinished ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-6">
              <div className="h-16 w-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center text-3xl">
                <span role="img" aria-label="trophy">🏆</span>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black text-white">Buổi Ôn Tập Hoàn Tất!</h4>
                <p className="text-xs text-slate-450 leading-relaxed max-w-md">
                  Tuyệt vời! Bạn đã chinh phục thành công <span className="font-extrabold text-indigo-400">{srsQuizzesList.length} câu hỏi ôn tập</span>. 
                  Hệ thống đã cập nhật chu kỳ ôn luyện theo thuật toán **SuperMemo-2 (SM2)**.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="bg-[#0c1020]/45 border border-slate-900 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Chính Xác</span>
                  <span className="text-base font-black text-indigo-400">{sessionScore} / {srsQuizzesList.length}</span>
                </div>
                <div className="bg-[#0c1020]/45 border border-slate-900 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">XP Cộng Thêm</span>
                  <span className="text-base font-black text-emerald-400">+{totalXpEarned} XP</span>
                </div>
              </div>
              <Button onClick={onClose} className="w-full max-w-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3.5 rounded-xl border-none shadow-lg shadow-blue-500/25 text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all">
                Hoàn Tất Ôn Tập
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-500 tracking-wider">
                <span className="bg-indigo-950/40 text-indigo-400 px-2 py-0.5 rounded border border-indigo-950/60 uppercase">SRS PRACTICE SESSION</span>
                <span className="text-indigo-400">CÂU {currentQuizIdx + 1}/{srsQuizzesList.length}</span>
              </div>
              <div className="w-full bg-slate-900/50 rounded-full h-1 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-1 rounded-full transition-all duration-300" style={{ width: `${(currentQuizIdx / srsQuizzesList.length) * 100}%` }} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest px-2 py-0.5 bg-indigo-950/40 rounded border border-indigo-950">
                  {currentSrsType === 'SENTENCE_BUILDER' ? <span>Sentence Rebuilder <span role="img" aria-label="puzzle">🧩</span></span> : <span>Error Spotlight <span role="img" aria-label="search">🔍</span></span>}
                </span>
                <h4 className="text-base font-bold text-white pt-2 leading-relaxed">{currentSrsQuestion.text || 'Sắp xếp hoặc sửa lỗi câu sau:'}</h4>
              </div>

              {currentSrsType === 'SENTENCE_BUILDER' && currentSrsQuestion.words && (
                <div className="space-y-4">
                  <div className={`min-h-[64px] p-4 bg-[#0c1020]/45 border rounded-2xl flex flex-wrap gap-2 items-center transition-all ${isAnswered ? isCorrect ? 'border-emerald-500/35 bg-emerald-500/5' : 'border-rose-500/35 bg-rose-500/5 animate-[shake_0.4s_ease-in-out]' : 'border-slate-850'}`}>
                    {selectedWords.length === 0 ? <span className="text-xs font-semibold text-slate-500">Click chọn các từ bên dưới để lắp ghép câu hoàn chỉnh...</span> : selectedWords.map((word, idx) => (
                      <button key={`${word}-${idx}`} disabled={isAnswered} onClick={() => handleRemoveWord(idx)} className={`bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-950 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${!isAnswered ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`}>{word} {!isAnswered && <X className="h-3 w-3 text-indigo-450" />}</button>
                    ))}
                  </div>
                  {!isAnswered && selectedWords.length > 0 && (
                    <div className="flex justify-end"><button onClick={handleClearWords} className="bg-slate-900 hover:bg-slate-850 text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-850 flex items-center gap-1 cursor-pointer transition"><RefreshCw className="h-3 w-3" /> Xóa hết</button></div>
                  )}
                  {!isAnswered && (
                    <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl space-y-3">
                      <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase block">Kho từ vựng sẵn có</span>
                      <div className="flex flex-wrap gap-2">
                        {shuffledWords.map((word, idx) => {
                          const isUsedUp = selectedWords.filter(w => w === word).length >= (currentSrsQuestion.words || []).filter((w: string) => w === word).length;
                          return <button key={`${word}-avail-${idx}`} disabled={isUsedUp} onClick={() => handleWordClick(word)} className={`text-xs font-bold px-3 py-2 rounded-xl transition ${isUsedUp ? 'bg-slate-950 text-slate-700 border border-slate-900 opacity-25 cursor-default' : 'bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-750 text-slate-200 cursor-pointer hover:scale-105 active:scale-95'}`}>{word}</button>;
                        })}
                      </div>
                    </div>
                  )}
                  {!isAnswered && selectedWords.length > 0 && (
                    <div className="pt-2 flex justify-end"><Button onClick={handleCheckSentenceBuilder} className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-550 hover:to-blue-550 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl border-none shadow-md shadow-indigo-500/15 flex items-center gap-1.5 cursor-pointer transition active:scale-95 uppercase tracking-wider"><Check className="h-4 w-4" /> Kiểm Tra Câu</Button></div>
                  )}
                </div>
              )}

              {currentSrsType === 'ERROR_SPOTLIGHT' && currentSrsQuestion.sentence && (
                <div className="space-y-4">
                  <div className="bg-[#0c1020]/45 border border-slate-850 rounded-2xl p-6 text-center space-y-4">
                    <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase block">Click vào từ chứa lỗi ngữ pháp trong câu:</span>
                    <div className="flex flex-wrap justify-center gap-2.5">
                      {currentSrsQuestion.sentence.split(' ').map((word: string, idx: number) => {
                        const cleanWord = word.replace(/[.,!?;]/g, '');
                        const isSelected = selectedErrorWord === cleanWord;
                        const isCorrectTarget = cleanWord.toLowerCase() === currentSrsQuestion.incorrectWord?.toLowerCase();
                        let wordStyles = 'bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-200';
                        if (isSelected) wordStyles = isAnswered ? isCorrectTarget ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-450 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-black' : 'bg-rose-500/10 border-rose-500/40 text-rose-450 animate-[shake_0.4s_ease-in-out] font-black' : 'bg-indigo-600/15 border-indigo-500 text-indigo-400 font-extrabold scale-105';
                        else if (isAnswered && isCorrectTarget) wordStyles = 'bg-emerald-500/5 border-emerald-500/20 text-emerald-450';
                        return <button key={`${word}-${idx}`} type="button" disabled={isAnswered} onClick={() => handleSelectErrorWord(word)} className={`text-sm font-bold px-3 py-2 rounded-xl transition ${!isAnswered ? 'cursor-pointer hover:scale-110 active:scale-90' : 'cursor-default'} ${wordStyles}`}>{word}</button>;
                      })}
                    </div>
                  </div>
                  {selectedErrorWord && (
                    <div className={`p-5 bg-slate-950/40 border rounded-2xl space-y-3 transition-all ${isAnswered ? isCorrect ? 'border-emerald-500/35 bg-emerald-500/5' : 'border-rose-500/35 bg-rose-500/5' : 'border-slate-900'}`}>
                      <div className="flex items-center justify-between"><span className="text-[10px] font-black text-slate-500 tracking-wider uppercase">Từ bị sai: <span className="text-indigo-400 font-extrabold">{selectedErrorWord}</span></span>{isAnswered && <span className="text-xs font-bold text-slate-400">Từ sửa đúng: <span className="text-emerald-400">{currentSrsQuestion.correctWord}</span></span>}</div>
                      <div className="flex gap-3"><input type="text" disabled={isAnswered} placeholder="Nhập từ thay thế sửa lại đúng tại đây..." value={correctedText} onChange={(e) => setCorrectedText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckErrorSpotlight()} className="flex-1 bg-slate-900 border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-200 transition" />{!isAnswered && <Button onClick={handleCheckErrorSpotlight} disabled={!correctedText} className="bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold px-4 py-2.5 rounded-xl border-none shadow-md shadow-indigo-600/10 transition active:scale-95 flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Kiểm Tra</Button>}</div>
                    </div>
                  )}
                </div>
              )}

              {isAnswered && (
                <div className={`border rounded-2xl p-5 space-y-2 animate-fadeIn ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
                  <div className="flex items-center gap-1.5">{isCorrect ? <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Chính xác! (+10 XP)</span> : <span className="text-xs font-bold text-rose-400 flex items-center gap-1"><XCircle className="h-4 w-4" /> Chưa chính xác! (+2 XP)</span>}</div>
                  <span className="text-[10px] font-black text-indigo-400 tracking-wider uppercase block pt-1.5">Giải thích đáp án:</span>
                  <p className="text-xs text-slate-350 leading-relaxed font-medium">{currentSrsQuestion.explanation}</p>
                </div>
              )}
              {isAnswered && (
                <div className="pt-2 flex justify-end"><Button onClick={handleNextSrs} className="bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold px-6 py-2.5 rounded-xl border-none shadow-md shadow-indigo-500/15 text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all animate-fadeIn">{currentQuizIdx < srsQuizzesList.length - 1 ? 'Tiếp Tục' : 'Kết Quả'}<X className="h-3.5 w-3.5 rotate-135" /></Button></div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
