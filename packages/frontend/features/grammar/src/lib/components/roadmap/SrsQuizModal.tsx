import { useState, useEffect } from 'react';
import { X, Check, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button, Input } from '@spark-nest-ed/frontend-shared-components';
import { useSrsDueQuizzes, useSubmitSrsFeedback } from '../../hooks';
import type { ExamQuestion } from '../../types';
import { GRAMMAR_UI_TEXT } from '../../constants';

const T = GRAMMAR_UI_TEXT.srsQuizModal;

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
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto animate-scaleUp">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-border pb-4 relative z-10">
          <div className="flex items-center gap-2">
            <span role="img" aria-label="brain">🧠</span>
            <div>
              <h3 className="text-base font-extrabold text-foreground">{T.title}</h3>
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">{T.subtitle}</span>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer hover:scale-105 active:scale-95 border-none">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative z-10 space-y-6">
          {loadingSrs ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <span className="text-xs font-bold">{T.loading}</span>
            </div>
          ) : srsQuizzesList.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center text-3xl animate-bounce">
                <span role="img" aria-label="success-party">🎉</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-foreground">{T.emptyTitle}</h4>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                  {T.emptyDesc}
                </p>
              </div>
              <Button onClick={onClose} className="bg-muted border border-border text-muted-foreground font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer hover:bg-muted/80 hover:text-foreground active:scale-95">
                {T.btnBackToRoadmap}
              </Button>
            </div>
          ) : isSessionFinished ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-6">
              <div className="h-16 w-16 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center text-3xl">
                <span role="img" aria-label="trophy">🏆</span>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black text-foreground">{T.finishedTitle}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                  {T.finishedDesc.split('{count}')[0]}<span className="font-extrabold text-primary">{srsQuizzesList.length} câu hỏi ôn tập</span>{T.finishedDesc.split('{count}')[1]?.replace(' câu hỏi ôn tập. ', '. ')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="bg-muted/30 border border-border rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase">{T.statCorrect}</span>
                  <span className="text-base font-black text-primary">{sessionScore} / {srsQuizzesList.length}</span>
                </div>
                <div className="bg-muted/30 border border-border rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase">{T.statXpBonus}</span>
                  <span className="text-base font-black text-emerald-500">+{totalXpEarned} XP</span>
                </div>
              </div>
              <Button onClick={onClose} className="w-full max-w-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-extrabold py-3.5 rounded-xl border-none shadow-lg text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all">
                {T.btnFinishReview}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground tracking-wider">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 uppercase">{T.sessionBadge}</span>
                <span className="text-primary">{T.questionProgress.replace('{current}', String(currentQuizIdx + 1)).replace('{total}', String(srsQuizzesList.length))}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 h-1 rounded-full transition-all duration-300" style={{ width: `${(currentQuizIdx / srsQuizzesList.length) * 100}%` }} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-primary uppercase tracking-widest px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
                  {currentSrsType === 'SENTENCE_BUILDER' ? <span>{T.typeSentenceRebuilder}</span> : <span>{T.typeErrorSpotlight}</span>}
                </span>
                <h4 className="text-base font-bold text-foreground pt-2 leading-relaxed">{currentSrsQuestion.text || T.defaultQuestion}</h4>
              </div>

              {currentSrsType === 'SENTENCE_BUILDER' && currentSrsQuestion.words && (
                <div className="space-y-4">
                  <div className={`min-h-[64px] p-4 bg-muted/30 border border-border rounded-2xl flex flex-wrap gap-2 items-center transition-all ${isAnswered ? isCorrect ? 'border-emerald-500/35 bg-emerald-500/5' : 'border-rose-500/35 bg-rose-500/5 animate-[shake_0.4s_ease-in-out]' : ''}`}>
                    {selectedWords.length === 0 ? <span className="text-xs font-semibold text-muted-foreground">{T.placeholderSentence}</span> : selectedWords.map((word, idx) => (
                      <button key={`${word}-${idx}`} disabled={isAnswered} onClick={() => handleRemoveWord(idx)} className={`bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${!isAnswered ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`}>{word} {!isAnswered && <X className="h-3 w-3 text-primary/80" />}</button>
                    ))}
                  </div>
                  {!isAnswered && selectedWords.length > 0 && (
                    <div className="flex justify-end"><button onClick={handleClearWords} className="bg-muted hover:bg-muted/80 text-muted-foreground text-[10px] font-bold px-3 py-1.5 rounded-lg border border-border flex items-center gap-1 cursor-pointer transition"><RefreshCw className="h-3 w-3" /> {T.btnClearAll}</button></div>
                  )}
                  {!isAnswered && (
                    <div className="bg-muted/20 p-4 border border-border rounded-2xl space-y-3">
                      <span className="text-[10px] font-black text-muted-foreground tracking-wider uppercase block">{T.wordPoolLabel}</span>
                      <div className="flex flex-wrap gap-2">
                        {shuffledWords.map((word, idx) => {
                          const isUsedUp = selectedWords.filter(w => w === word).length >= (currentSrsQuestion.words || []).filter((w: string) => w === word).length;
                          return <button key={`${word}-avail-${idx}`} disabled={isUsedUp} onClick={() => handleWordClick(word)} className={`text-xs font-bold px-3 py-2 rounded-xl transition ${isUsedUp ? 'bg-background text-muted-foreground border border-border opacity-25 cursor-default' : 'bg-muted hover:bg-muted/80 border border-border text-foreground cursor-pointer hover:scale-105 active:scale-95'}`}>{word}</button>;
                        })}
                      </div>
                    </div>
                  )}
                  {!isAnswered && selectedWords.length > 0 && (
                    <div className="pt-2 flex justify-end"><Button onClick={handleCheckSentenceBuilder} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-extrabold text-xs px-6 py-2.5 rounded-xl border-none shadow-md flex items-center gap-1.5 cursor-pointer transition active:scale-95 uppercase tracking-wider"><Check className="h-4 w-4" /> {T.btnCheckSentence}</Button></div>
                  )}
                </div>
              )}

              {currentSrsType === 'ERROR_SPOTLIGHT' && currentSrsQuestion.sentence && (
                <div className="space-y-4">
                  <div className="bg-muted/30 border border-border rounded-2xl p-6 text-center space-y-4">
                    <span className="text-[10px] font-black text-muted-foreground tracking-wider uppercase block">{T.instructionErrorSpotlight}</span>
                    <div className="flex flex-wrap justify-center gap-2.5">
                      {currentSrsQuestion.sentence.split(' ').map((word: string, idx: number) => {
                        const cleanWord = word.replace(/[.,!?;]/g, '');
                        const isSelected = selectedErrorWord === cleanWord;
                        const isCorrectTarget = cleanWord.toLowerCase() === currentSrsQuestion.incorrectWord?.toLowerCase();
                        let wordStyles = 'bg-muted hover:bg-muted/80 border border-border text-foreground';
                        if (isSelected) wordStyles = isAnswered ? isCorrectTarget ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-black' : 'bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-450 animate-[shake_0.4s_ease-in-out] font-black' : 'bg-primary/10 border border-primary text-primary font-extrabold scale-105';
                        else if (isAnswered && isCorrectTarget) wordStyles = 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
                        return <button key={`${word}-${idx}`} type="button" disabled={isAnswered} onClick={() => handleSelectErrorWord(word)} className={`text-sm font-bold px-3 py-2 rounded-xl transition ${!isAnswered ? 'cursor-pointer hover:scale-110 active:scale-90' : 'cursor-default'} ${wordStyles}`}>{word}</button>;
                      })}
                    </div>
                  </div>
                  {selectedErrorWord && (
                    <div className={`p-5 bg-muted/20 border border-border rounded-2xl space-y-3 transition-all ${isAnswered ? isCorrect ? 'border-emerald-500/35 bg-emerald-500/5' : 'border-rose-500/35 bg-rose-500/5' : ''}`}>
                      <div className="flex items-center justify-between"><span className="text-[10px] font-black text-muted-foreground tracking-wider uppercase">{T.labelWrongWord} <span className="text-primary font-extrabold">{selectedErrorWord}</span></span>{isAnswered && <span className="text-xs font-bold text-muted-foreground">{T.labelCorrectWord} <span className="text-emerald-500">{currentSrsQuestion.correctWord}</span></span>}</div>
                      <div className="flex gap-3"><Input type="text" disabled={isAnswered} placeholder={T.placeholderCorrection} value={correctedText} onChange={(e) => setCorrectedText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckErrorSpotlight()} className="flex-1 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-2.5 text-xs font-bold text-foreground transition" />{!isAnswered && <Button onClick={handleCheckErrorSpotlight} disabled={!correctedText} className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl border-none shadow-md transition active:scale-95 flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> {T.btnCheck}</Button>}</div>
                    </div>
                  )}
                </div>
              )}

              {isAnswered && (
                <div className={`border rounded-2xl p-5 space-y-2 animate-fadeIn ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-destructive/5 border-destructive/10'}`}>
                  <div className="flex items-center gap-1.5">{isCorrect ? <span className="text-xs font-bold text-emerald-500 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> {T.feedbackCorrect}</span> : <span className="text-xs font-bold text-destructive flex items-center gap-1"><XCircle className="h-4 w-4" /> {T.feedbackIncorrect}</span>}</div>
                  <span className="text-[10px] font-black text-primary tracking-wider uppercase block pt-1.5">{T.explanationLabel}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">{currentSrsQuestion.explanation}</p>
                </div>
              )}
              {isAnswered && (
                <div className="pt-2 flex justify-end"><Button onClick={handleNextSrs} className="bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold px-6 py-2.5 rounded-xl border-none shadow-md text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all animate-fadeIn">{currentQuizIdx < srsQuizzesList.length - 1 ? T.btnNext : T.btnResult}<X className="h-3.5 w-3.5 rotate-135" /></Button></div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
