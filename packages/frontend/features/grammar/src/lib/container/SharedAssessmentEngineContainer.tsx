import { FC, useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Home,
  Timer,
  Flag,
  Award,
  BookOpen,
  Sparkles,
  ArrowRight,
  Printer,
  Bookmark,
} from 'lucide-react';

import { Button } from '@spark-nest-ed/frontend-shared-components';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import type { ExamQuestion } from '../types';
import { useSaveGrammarTrap } from '../hooks';
import { toast } from 'sonner';
import { GRAMMAR_UI_TEXT } from '../constants';

interface AssessmentAnswer {
  userAnswer?: string;
  words?: string[];
  incorrectWord?: string | null;
  correctedText?: string;
  isAnswered?: boolean;
}

interface ExamAttemptResult {
  success: boolean;
  proficiency: number;
  isPassed: boolean;
  xpEarned: number;
  newCertificateIssued: boolean;
  certificate?: {
    id?: string;
    level?: string;
    examType?: string;
    serialNumber?: string;
    issuedAt?: string;
  } | null;
}

interface RecoveryData {
  answers?: Record<string, AssessmentAnswer>;
  flaggedIds?: string[];
  currentIdx?: number;
  timeLeft?: number;
  score?: number;
  wrongQuestionIds?: string[];
  isAnswered?: boolean;
  isCorrect?: boolean | null;
  selectedOpt?: string | null;
  selectedWords?: string[];
  selectedErrorWord?: string | null;
  correctedText?: string;
}

interface SharedAssessmentEngineContainerProps {
  questions: ExamQuestion[];
  timeLimit: number; // in seconds
  examType: 'CEFR' | 'TOEIC' | 'IELTS' | 'VSTEP';
  examTitle: string;
  onFinish: (correctCount: number, totalCount: number) => Promise<unknown>;
  onBack: () => void;
  newCertificate?: unknown;
}

export const SharedAssessmentEngineContainer: FC<
  SharedAssessmentEngineContainerProps
> = ({ questions, timeLimit, examType, examTitle, onFinish, onBack }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  const saveTrapMutation = useSaveGrammarTrap();
  const [savedTrapIds, setSavedTrapIds] = useState<string[]>([]);

  const handleSaveTrap = async (q: ExamQuestion, userAnswer: string) => {
    try {
      await saveTrapMutation.mutateAsync({
        questionId: q.id,
        questionText:
          q.type === 'ERROR_SPOTLIGHT' ? q.sentence || q.text : q.text,
        questionType: q.type || 'MULTIPLE_CHOICE',
        questionData: {
          options: q.options || [],
          words: q.words || [],
          sentence: q.sentence || '',
          incorrectWord: q.incorrectWord || '',
          correctWord: q.correctWord || '',
        },
        category: q.category || 'syntax',
        userAnswer: userAnswer || 'Đã trả lời chưa chính xác',
        correctAnswer:
          q.type === 'ERROR_SPOTLIGHT'
            ? `${q.incorrectWord} -> ${q.correctWord}`
            : q.answer,
        explanation: q.explanation,
      });
      setSavedTrapIds((prev) => [...prev, q.id]);
      toast.success(GRAMMAR_UI_TEXT.assessmentEngine.toastSaveSuccess);
    } catch {
      toast.error(GRAMMAR_UI_TEXT.assessmentEngine.toastSaveError);
    }
  };
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<ExamAttemptResult | null>(null);

  // States chuyên dụng cho từng dạng câu hỏi (cục bộ câu hiện tại)
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [selectedErrorWord, setSelectedErrorWord] = useState<string | null>(
    null
  );
  const [correctedText, setCorrectedText] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentQuestion = questions[currentIdx] || questions[0];

  const sessionKey = `sne_session_${examType}_${examTitle.replace(
    /\s+/g,
    '_'
  )}`;
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);

  // Check for saved session on mount
  useEffect(() => {
    const saved = localStorage.getItem(sessionKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          (Object.keys(parsed.answers || {}).length > 0 ||
            parsed.flaggedIds?.length > 0 ||
            parsed.currentIdx > 0) &&
          parsed.timeLeft > 0
        ) {
          setRecoveryData(parsed);
          setShowRecoveryModal(true);
        }
      } catch (err) {
        console.error('Lỗi phân tích cú pháp phiên lưu trữ:', err);
      }
    }
  }, [sessionKey]);

  const handleRecover = () => {
    if (recoveryData) {
      setAnswers(recoveryData.answers || {});
      setFlaggedIds(recoveryData.flaggedIds || []);
      setTimeLeft(recoveryData.timeLeft ?? timeLimit);
      setCurrentIdx(recoveryData.currentIdx ?? 0);
      toast.success(
        GRAMMAR_UI_TEXT.assessmentEngine.toastRecoverSuccess
      );
    }
    setShowRecoveryModal(false);
  };

  const handleDiscard = () => {
    localStorage.removeItem(sessionKey);
    setShowRecoveryModal(false);
    toast.info(GRAMMAR_UI_TEXT.assessmentEngine.toastDiscardSuccess);
  };

  // Tự động lưu trạng thái (Autosave)
  useEffect(() => {
    if (
      !isCompleted &&
      !showRecoveryModal &&
      timeLeft > 0 &&
      (Object.keys(answers).length > 0 ||
        flaggedIds.length > 0 ||
        currentIdx > 0)
    ) {
      localStorage.setItem(
        sessionKey,
        JSON.stringify({
          answers,
          flaggedIds,
          timeLeft,
          currentIdx,
        })
      );
    }
  }, [
    answers,
    flaggedIds,
    timeLeft,
    currentIdx,
    isCompleted,
    showRecoveryModal,
    sessionKey,
  ]);

  // Khởi động bộ đếm giờ (dừng đếm khi hiển thị modal khôi phục)
  useEffect(() => {
    if (isCompleted || showRecoveryModal) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted, showRecoveryModal, questions]);

  // Đồng bộ lại trạng thái khi chuyển câu hỏi
  useEffect(() => {
    if (!currentQuestion) return;
    const saved = answers[currentQuestion.id];

    // Reset states
    setSelectedOpt(null);
    setSelectedWords([]);
    setSelectedErrorWord(null);
    setCorrectedText('');

    if (saved) {
      if (currentQuestion.type === 'MULTIPLE_CHOICE') {
        setSelectedOpt(saved.userAnswer || null);
      } else if (currentQuestion.type === 'SENTENCE_BUILDER') {
        setSelectedWords(saved.words || []);
      } else if (currentQuestion.type === 'ERROR_SPOTLIGHT') {
        setSelectedErrorWord(saved.incorrectWord || null);
        setCorrectedText(saved.correctedText || '');
      }
    }
  }, [currentIdx, currentQuestion, answers]);

  // Đánh dấu cắm cờ xem lại
  const toggleFlag = (qId: string) => {
    setFlaggedIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  // Lưu tạm đáp án Trắc nghiệm
  const handleSelectOption = (opt: string) => {
    setSelectedOpt(opt);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        userAnswer: opt,
        isAnswered: true,
      },
    }));
  };

  // Lưu tạm Sentence Builder
  const handleWordClick = (word: string) => {
    const updated = [...selectedWords, word];
    setSelectedWords(updated);
    const rawAnswer = updated
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\s+([.,!?;])/g, '$1');
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        userAnswer: rawAnswer,
        words: updated,
        isAnswered: true,
      },
    }));
  };

  const handleRemoveWord = (wordIndex: number) => {
    const updated = selectedWords.filter((_, idx) => idx !== wordIndex);
    setSelectedWords(updated);
    const rawAnswer = updated
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\s+([.,!?;])/g, '$1');
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        userAnswer: rawAnswer,
        words: updated,
        isAnswered: updated.length > 0,
      },
    }));
  };

  const handleClearWords = () => {
    setSelectedWords([]);
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
  };

  // Lưu tạm Error Spotlight
  const handleSelectErrorWord = (word: string) => {
    const cleanWord = word.replace(/[.,!?;]/g, '');
    setSelectedErrorWord(cleanWord);
    updateErrorSpotlightAnswer(cleanWord, correctedText);
  };

  const handleCorrectionChange = (text: string) => {
    setCorrectedText(text);
    if (selectedErrorWord) {
      updateErrorSpotlightAnswer(selectedErrorWord, text);
    }
  };

  const updateErrorSpotlightAnswer = (incWord: string, corrWord: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        userAnswer: corrWord.trim(),
        incorrectWord: incWord,
        correctedText: corrWord,
        isAnswered: incWord !== null && corrWord.trim() !== '',
      },
    }));
  };

  // Tự động nộp bài khi hết giờ
  const handleAutoSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    await submitExam();
  };

  // Tính điểm và nộp bài
  const submitExam = async () => {
    setIsSubmitting(true);
    let correctCount = 0;

    questions.forEach((q) => {
      const saved = answers[q.id];
      if (!saved) return;

      if (q.type === 'MULTIPLE_CHOICE') {
        if (saved.userAnswer === q.answer) correctCount++;
      } else if (q.type === 'SENTENCE_BUILDER') {
        if (saved.userAnswer?.toLowerCase() === q.answer.toLowerCase())
          correctCount++;
      } else if (q.type === 'ERROR_SPOTLIGHT') {
        const isTargetCorrect =
          saved.incorrectWord?.toLowerCase() === q.incorrectWord?.toLowerCase();
        const isCorrectionCorrect =
          saved.correctedText?.trim().toLowerCase() ===
          q.correctWord?.toLowerCase();
        if (isTargetCorrect && isCorrectionCorrect) correctCount++;
      }
    });

    try {
      const res = await onFinish(correctCount, questions.length);
      setExamResult(res as ExamAttemptResult);
      setIsCompleted(true);
      localStorage.removeItem(sessionKey); // Xóa sạch session khi đã nộp bài thành công
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Định dạng thời gian
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  if (isCompleted && examResult) {
    const proficiency = examResult.proficiency ?? 0;
    const xpEarned = examResult.xpEarned ?? 0;
    const isPassed = examResult.isPassed ?? false;
    const certificate = examResult.certificate;

    // Quy đổi thang điểm chuẩn
    let scaleTitle = GRAMMAR_UI_TEXT.assessmentEngine.resultsTitle;
    let scaleVal = `${proficiency}%`;
    let scaleDesc = `Trả lời đúng ${Math.round(
      (proficiency / 100) * questions.length
    )}/${questions.length} câu hỏi.`;

    if (examType === 'TOEIC') {
      scaleTitle = 'ƯỚC LƯỢNG TOEIC PART 5';
      const points = Math.round((proficiency / 100) * 250) + 150;
      scaleVal = GRAMMAR_UI_TEXT.assessmentEngine.pointsLabel.replace('{points}', points.toString());
      scaleDesc =
        'Quy chuẩn tương đương theo phân bổ điểm ngữ pháp TOEIC Reading.';
    } else if (examType === 'IELTS') {
      scaleTitle = 'ƯỚC LƯỢNG GRAMMAR BAND';
      const band = (5.0 + (proficiency / 100) * 4.0).toFixed(1);
      scaleVal = GRAMMAR_UI_TEXT.assessmentEngine.bandLabel.replace('{band}', band);
      scaleDesc =
        'Ước lượng năng lực cú pháp và độ chính xác cấu trúc theo IELTS.';
    } else if (examType === 'VSTEP') {
      scaleTitle = 'TRÌNH ĐỘ QUY CHUẨN VSTEP';
      scaleVal =
        proficiency >= 85
          ? GRAMMAR_UI_TEXT.assessmentEngine.vstepLevel1
          : proficiency >= 70
          ? GRAMMAR_UI_TEXT.assessmentEngine.vstepLevel2
          : proficiency >= 50
          ? GRAMMAR_UI_TEXT.assessmentEngine.vstepLevel3
          : GRAMMAR_UI_TEXT.assessmentEngine.vstepFailed;
      scaleDesc = GRAMMAR_UI_TEXT.assessmentEngine.vstepDesc;
    }

    return (
      <div className="max-w-full mx-auto bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 space-y-6 w-full">
            <div className="space-y-1">
              <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
                {examType} PRACTICE arena
              </span>
              <h2 className="text-2xl font-extrabold text-white pt-2">
                {examTitle}
              </h2>
            </div>

            {/* Quy đổi thang điểm */}
            <div className="p-6 rounded-2xl border border-border bg-muted/40 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-2 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-6">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                  {scaleTitle}
                </span>
                <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {scaleVal}
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  {scaleDesc}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isPassed
                        ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-sm font-extrabold text-white">
                    {isPassed
                      ? GRAMMAR_UI_TEXT.assessmentEngine.passedLabel
                      : GRAMMAR_UI_TEXT.assessmentEngine.failedLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Yêu cầu đạt tối thiểu **80%** điểm để vượt qua bài thi chuẩn
                  chỉ và đủ điều kiện cấp chứng nhận.
                </p>
                <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg p-2 text-center text-xs font-black">
                  {GRAMMAR_UI_TEXT.assessmentEngine.xpAccumulated.replace('{xp}', xpEarned.toString())}
                </div>
              </div>
            </div>

            {/* 3D Certificate Showcase Modal */}
            {examResult.newCertificateIssued && certificate && (
              <div className="p-6 rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-950/10 to-amber-950/20 text-center space-y-4 shadow-xl relative overflow-hidden animate-fadeIn">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
                <Award className="h-10 w-10 text-amber-400 mx-auto animate-pulse" />
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                    {GRAMMAR_UI_TEXT.assessmentEngine.certCongrats}
                  </span>
                  <h4 className="text-lg font-black text-white">
                    {GRAMMAR_UI_TEXT.assessmentEngine.certIssuedTitle}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
                    {GRAMMAR_UI_TEXT.assessmentEngine.certIssuedDesc
                      .replace('{examType}', examType)
                      .replace('{level}', certificate.level || '')}
                  </p>
                </div>

                {/* 3D Rotating Interactive Card representation */}
                <div className="perspective-1000 my-6 flex justify-center">
                  <div
                    className="relative w-80 h-48 bg-gradient-to-br from-card/90 to-card border border-amber-500/30 rounded-2xl p-5 shadow-2xl flex flex-col justify-between text-left transition-all duration-300 hover:border-amber-400/60"
                    style={{
                      transform: 'rotateX(8deg) rotateY(-5deg)',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {/* Watermark icon */}
                    <Award className="absolute right-4 bottom-4 h-24 w-24 text-amber-500/5 pointer-events-none" />

                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[9px] font-black text-amber-500 tracking-wider">
                          SPARK-NEXUS-ED CERTIFICATE
                        </div>
                        <div className="text-[10px] font-bold text-slate-400">
                          Community Grammar Mastery
                        </div>
                      </div>
                      <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase">
                        {examType} {certificate.level}
                      </span>
                    </div>

                    <div
                      className="space-y-1 py-3"
                      style={{ transform: 'translateZ(20px)' }}
                    >
                      <span className="text-[8px] text-slate-500 block uppercase tracking-wider">
                        HỌC VIÊN DANH DỰ
                      </span>
                      <div className="text-base font-black text-white bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
                        Học Viên Danh Dự
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-slate-900 pt-2">
                      <div>
                        <span className="text-[7px] text-slate-500 block uppercase">
                          {GRAMMAR_UI_TEXT.assessmentEngine.certSerialNumber}
                        </span>
                        <span className="text-[9px] font-mono text-slate-350">
                          {certificate.serialNumber}
                        </span>
                      </div>
                      <span className="text-[8px] text-slate-500 font-mono">
                        {GRAMMAR_UI_TEXT.assessmentEngine.certDateIssued.replace('{date}', new Date(certificate.issuedAt || '').toLocaleDateString())}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-2">
                  <Button
                    onClick={() => window.print()}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-850 py-2 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" /> {GRAMMAR_UI_TEXT.assessmentEngine.btnPrintCert}
                  </Button>
                </div>
              </div>
            )}

            {/* Actions panel */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={onBack}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3.5 rounded-xl border-none shadow-lg shadow-blue-500/25 text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all uppercase tracking-wider"
              >
                <Home className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentEngine.btnHome}
              </Button>
              {!isPassed && (
                <Button
                  onClick={() => {
                    setIsCompleted(false);
                    setTimeLeft(timeLimit);
                    setAnswers({});
                    setFlaggedIds([]);
                    setCurrentIdx(0);
                  }}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-3.5 px-6 rounded-xl border-none shadow-lg shadow-rose-500/25 text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all uppercase tracking-wider"
                >
                  <RotateCcw className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentEngine.btnRetryExam}
                </Button>
              )}
            </div>

            {/* Detailed Wrong Answers */}
            <div className="mt-8 space-y-4 text-left w-full">
              <h3 className="text-base font-extrabold text-slate-200 border-b border-slate-900 pb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-400" />
                {GRAMMAR_UI_TEXT.assessmentEngine.detailedExplanations.replace('{count}', questions.length.toString())}
              </h3>
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const saved = answers[q.id];
                  let isAnsCorrect = false;

                  if (saved) {
                    if (q.type === 'MULTIPLE_CHOICE') {
                      isAnsCorrect = saved.userAnswer === q.answer;
                    } else if (q.type === 'SENTENCE_BUILDER') {
                      isAnsCorrect =
                        saved.userAnswer?.toLowerCase() ===
                        q.answer.toLowerCase();
                    } else if (q.type === 'ERROR_SPOTLIGHT') {
                      const isTargetCorrect =
                        saved.incorrectWord?.toLowerCase() ===
                        q.incorrectWord?.toLowerCase();
                      const isCorrectionCorrect =
                        saved.correctedText?.trim().toLowerCase() ===
                        q.correctWord?.toLowerCase();
                      isAnsCorrect = isTargetCorrect && isCorrectionCorrect;
                    }
                  }

                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "bg-muted/80 border rounded-xl p-4 space-y-2",
                        isAnsCorrect ? 'border-emerald-500/10' : 'border-rose-500/10'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500">
                          CÂU SỐ {idx + 1} • {q.category.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2">
                          {!isAnsCorrect && (
                            <Button
                              onClick={() =>
                                handleSaveTrap(q, saved?.userAnswer || '')
                              }
                              disabled={savedTrapIds.includes(q.id)}
                              className="bg-card border border-border hover:border-slate-700 text-[9px] font-black text-rose-400 hover:text-rose-350 px-2 py-1 rounded-lg cursor-pointer transition active:scale-95 flex items-center gap-1 uppercase tracking-wider disabled:opacity-50 disabled:text-slate-500 disabled:border-border disabled:cursor-default"
                            >
                              <Bookmark className="h-3 w-3" />
                              {savedTrapIds.includes(q.id)
                                ? GRAMMAR_UI_TEXT.assessmentEngine.btnSavedTrap
                                : `💾 ${GRAMMAR_UI_TEXT.assessmentEngine.btnSaveTrap}`}
                            </Button>
                          )}
                          <span
                            className={`text-[10px] font-black ${
                              isAnsCorrect
                                ? 'text-emerald-450'
                                : 'text-rose-400'
                            }`}
                          >
                            {isAnsCorrect ? GRAMMAR_UI_TEXT.assessmentEngine.correctBadge : GRAMMAR_UI_TEXT.assessmentEngine.wrongBadge}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-white leading-relaxed">
                        {q.type === 'ERROR_SPOTLIGHT' ? q.sentence : q.text}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-850">
                          <span className="text-[8px] font-black text-slate-500 uppercase block mb-0.5">
                            {GRAMMAR_UI_TEXT.assessmentEngine.answerUser}
                          </span>
                          <span
                            className={
                              isAnsCorrect
                                ? 'text-emerald-400 font-bold'
                                : 'text-rose-450 font-bold'
                            }
                          >
                            {saved?.userAnswer || GRAMMAR_UI_TEXT.assessmentEngine.unanswered}
                          </span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-850">
                          <span className="text-[8px] font-black text-slate-500 uppercase block mb-0.5">
                            {GRAMMAR_UI_TEXT.assessmentEngine.answerCorrect}
                          </span>
                          <span className="text-emerald-400 font-bold">
                            {q.type === 'ERROR_SPOTLIGHT'
                              ? `${q.incorrectWord} -> ${q.correctWord}`
                              : q.answer}
                          </span>
                        </div>
                      </div>
                      <div className="bg-blue-500/5 p-3.5 rounded-lg border border-blue-500/10 mt-2">
                        <span className="text-[9px] font-black text-blue-400 uppercase block mb-1">
                          {GRAMMAR_UI_TEXT.assessmentEngine.pedagogicalExplanation}
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = (currentIdx / questions.length) * 100;
  const qType = currentQuestion?.type || 'MULTIPLE_CHOICE';

  return (
    <div className="max-w-2xl mx-auto bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <button
          type="button"
          onClick={onBack}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted border border-border text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <span className="text-xs font-black text-slate-350 uppercase tracking-widest hidden sm:block">
          {GRAMMAR_UI_TEXT.assessmentEngine.timerLabel.replace('{examType}', examType)}
        </span>

        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs border transition-colors ${
            timeLeft <= 60
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse'
              : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
          }`}
        >
          <Timer className="h-4 w-4" />
          <span className="w-9 text-center font-mono">{formattedTime}</span>
        </div>
      </div>

      {/* Quest HUD & Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-black text-slate-500 tracking-wider">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            STANDARD ASSESSMENT ENGINE
          </span>
          <span className="text-blue-400">
            {GRAMMAR_UI_TEXT.levelGraduation.questionIndex
              .replace('{current}', (currentIdx + 1).toString())
              .replace('{total}', questions.length.toString())}
          </span>
        </div>
        <div className="w-full bg-slate-900/50 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Flag board */}
      <div className="flex justify-between items-center bg-muted/30 border border-border rounded-xl p-3">
        <span className="text-xs text-slate-400 font-medium">
          Bạn có muốn xem lại câu hỏi này sau?
        </span>
        <button
          onClick={() => toggleFlag(currentQuestion.id)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            flaggedIds.includes(currentQuestion.id)
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-450'
              : 'bg-slate-900 border-slate-850 text-slate-500 hover:text-slate-350'
          }`}
        >
          <Flag className="h-3.5 w-3.5" />
          {flaggedIds.includes(currentQuestion.id)
            ? GRAMMAR_UI_TEXT.assessmentEngine.flaggedBadge
            : GRAMMAR_UI_TEXT.assessmentEngine.flagQuestion}
        </button>
      </div>

      {/* Question panel */}
      <div className="space-y-5">
        <div className="space-y-1">
          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest px-2 py-0.5 bg-indigo-950/40 rounded border border-indigo-950">
            {qType === 'SENTENCE_BUILDER'
              ? GRAMMAR_UI_TEXT.assessmentEngine.sentenceRebuilder
              : qType === 'ERROR_SPOTLIGHT'
              ? GRAMMAR_UI_TEXT.assessmentEngine.errorSpotlight
              : GRAMMAR_UI_TEXT.assessmentEngine.multipleChoice}
          </span>
          <h3 className="text-base font-bold text-white leading-relaxed pt-2">
            {currentQuestion?.text}
          </h3>
        </div>

        {/* 1. RENDER TRẮC NGHIỆM TRUYỀN THỐNG */}
        {qType === 'MULTIPLE_CHOICE' && currentQuestion?.options && (
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOpt === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(opt)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border text-xs font-semibold cursor-pointer active:scale-99 transition-all flex items-center justify-between",
                    isSelected
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                      : 'bg-muted/45 border-border hover:border-slate-700 text-slate-200'
                  )}
                >
                  <span>{opt}</span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 2. RENDER SENTENCE REBUILDER */}
        {qType === 'SENTENCE_BUILDER' && currentQuestion?.words && (
          <div className="space-y-4">
            {/* Khay hiển thị từ đã chọn */}
            <div className="min-h-16 p-4 rounded-2xl bg-slate-950/50 border border-slate-900 flex flex-wrap gap-2 items-center">
              {selectedWords.length === 0 ? (
                <span className="text-xs text-slate-600 font-medium italic">
                  Click chọn các từ phía dưới để lắp ghép câu...
                </span>
              ) : (
                selectedWords.map((word, wIdx) => (
                  <button
                    key={`${word}-${wIdx}`}
                    onClick={() => handleRemoveWord(wIdx)}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition-all cursor-pointer"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            {/* Khay chứa từ xáo trộn */}
            <div className="flex flex-wrap gap-2 justify-center py-2">
              {currentQuestion.words
                .filter((w) => {
                  // Đếm số lượng từ w xuất hiện trong words
                  const countInSource =
                    currentQuestion.words?.filter((x) => x === w).length || 0;
                  const countInSelected = selectedWords.filter(
                    (x) => x === w
                  ).length;
                  return countInSelected < countInSource;
                })
                .map((word, wIdx) => (
                  <button
                    key={`${word}-${wIdx}`}
                    onClick={() => handleWordClick(word)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    {word}
                  </button>
                ))}
            </div>

            {selectedWords.length > 0 && (
              <button
                onClick={handleClearWords}
                className="text-[10px] font-black text-rose-400 hover:text-rose-350 uppercase cursor-pointer"
              >
                Xóa tất cả từ đã ghép
              </button>
            )}
          </div>
        )}

        {/* 3. RENDER ERROR SPOTLIGHT */}
        {qType === 'ERROR_SPOTLIGHT' && currentQuestion?.sentence && (
          <div className="space-y-4">
            <span className="text-[10px] font-black text-slate-500 block uppercase">
              BƯỚC 1: CLICK TRỰC TIẾP VÀO TỪ VIẾT SAI NGỮ PHÁP DƯỚI ĐÂY:
            </span>
            <div className="flex flex-wrap gap-x-1 gap-y-2 bg-slate-950/30 border border-slate-900 p-4 rounded-2xl justify-center">
              {currentQuestion.sentence.split(/\s+/).map((word, wIdx) => {
                const cleanWord = word.replace(/[.,!?;]/g, '');
                const isSelected = selectedErrorWord === cleanWord;
                return (
                  <button
                    key={`${word}-${wIdx}`}
                    onClick={() => handleSelectErrorWord(word)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/15 border border-rose-500/30 text-rose-450 scale-102 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                        : 'bg-transparent border border-transparent text-slate-250 hover:bg-slate-900/60'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>

            {selectedErrorWord && (
              <div className="space-y-2 pt-2 animate-fadeIn">
                <span className="text-[10px] font-black text-slate-500 block uppercase">
                  BƯỚC 2: VIẾT LẠI TỪ SỬA ĐÚNG DÀNH CHO TỪ &quot;
                  {selectedErrorWord}&quot;:
                </span>
                <input
                  type="text"
                  value={correctedText}
                  onChange={(e) => handleCorrectionChange(e.target.value)}
                  placeholder="Gõ từ ngữ pháp sửa lại đúng vào đây..."
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Question Navigation Grid & Next Actions */}
      <div className="border-t border-slate-900 pt-5 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase">
            BẢNG CHỈ MỤC CÂU HỎI ({questions.length} CÂU)
          </span>
          <div className="flex items-center gap-3 text-[9px] font-black text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> Đã làm
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded bg-amber-500" /> Cắm cờ
            </span>
          </div>
        </div>

        {/* Lưới định vị câu hỏi */}
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
          {questions.map((q, idx) => {
            const isActive = currentIdx === idx;
            const isFlagged = flaggedIds.includes(q.id);
            const isAnswered = answers[q.id]?.isAnswered;

            let indicatorStyle =
              'bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-800';

            if (isAnswered) {
              indicatorStyle =
                'bg-blue-500/10 border-blue-500/25 text-blue-400 hover:border-blue-500/40';
            }
            if (isFlagged) {
              indicatorStyle =
                'bg-amber-500/10 border-amber-500/25 text-amber-400 hover:border-amber-500/40';
            }
            if (isActive) {
              indicatorStyle =
                'bg-slate-900 border-slate-600 text-white shadow-sm ring-1 ring-slate-800 scale-102';
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`py-2 rounded-lg border text-xs font-extrabold cursor-pointer transition-all ${indicatorStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Nút hành động chính */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="flex-1 border-slate-850 text-slate-400 hover:text-slate-200 text-xs py-3 rounded-xl font-bold flex items-center justify-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
          >
            {GRAMMAR_UI_TEXT.assessmentEngine.btnPrev}
          </Button>

          {currentIdx < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentIdx((prev) => prev + 1)}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white border border-slate-850 text-xs py-3 rounded-xl font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              {GRAMMAR_UI_TEXT.assessmentEngine.btnNext} <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={submitExam}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3 rounded-xl border-none shadow-lg shadow-blue-500/25 text-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                GRAMMAR_UI_TEXT.assessmentEngine.btnSubmitting
              ) : (
                <span>
                  {GRAMMAR_UI_TEXT.assessmentEngine.btnSubmit}
                </span>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Modal Khôi Phục Trạng Thái Làm Bài Dở Dang */}
      {showRecoveryModal && recoveryData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl shadow-blue-500/5 space-y-6 text-center overflow-hidden">
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-blue-600/10 blur-2xl pointer-events-none" />

            <div className="mx-auto h-14 w-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center animate-pulse">
              <Timer className="h-7 w-7 text-blue-400" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
                State Recovery{' '}
                <span role="img" aria-label="hourglass-flowing-sand">
                  ⏳
                </span>
              </span>
              <h3 className="text-xl font-extrabold text-white pt-1">
                {GRAMMAR_UI_TEXT.assessmentEngine.recoveryTitle}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {GRAMMAR_UI_TEXT.assessmentEngine.recoveryDesc}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={handleRecover}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3 rounded-xl border-none shadow-lg shadow-blue-500/20 text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider active:scale-98"
              >
                <RotateCcw className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentEngine.btnRecover}
              </Button>
              <Button
                onClick={handleDiscard}
                className="w-full bg-muted hover:bg-secondary text-rose-450 hover:text-rose-400 font-extrabold py-3 rounded-xl border border-border text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider active:scale-98"
              >
                {GRAMMAR_UI_TEXT.assessmentEngine.btnDiscard}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
