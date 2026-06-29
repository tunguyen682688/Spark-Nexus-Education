import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, RadioGroup, RadioGroupItem, Label } from '@spark-nest-ed/frontend-shared-components';
import { CheckCircle2, XCircle, Award, BookOpen, AlertCircle, ArrowRight, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { READING_UI_TEXT } from '../../constants';
import { useArticleQuiz, useSubmitArticleQuiz } from '../../hooks/use-reading';
import type { QuizResponse } from '../../types';

interface ArticleQuizProps {
  articleId: string;
  onQuizCompleted?: (score: number) => void;
}

export const ArticleQuiz: React.FC<ArticleQuizProps> = ({
  articleId,
  onQuizCompleted,
}) => {
  const { data: quizData, isLoading: loading, isError: error } = useArticleQuiz(articleId);
  const submitMutation = useSubmitArticleQuiz();
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<QuizResponse | null>(null);

  const questions = quizData?.questions || [];

  const handleSelectAnswer = (value: string) => {
    const currentQuestion = questions[currentIdx];
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await submitMutation.mutateAsync({
        articleId,
        answers: selectedAnswers,
      });
      setResults(response);
      if (onQuizCompleted) {
        onQuizCompleted(response.score);
      }
    } catch (err) {
      console.error('Failed to submit quiz', err);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentIdx(0);
    setResults(null);
  };

  const submitting = submitMutation.isPending;

  if (loading) {
    return (
      <Card className="max-w-[750px] mx-auto p-8 border-slate-100/80 shadow-md flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">{READING_UI_TEXT.components.reader.QUIZ_GENERATING}</p>
      </Card>
    );
  }

  if (error || questions.length === 0) {
    return (
      <Card className="max-w-[750px] mx-auto p-6 border-slate-100/80 shadow-md flex items-center gap-3 bg-red-50/50 border-red-100">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-slate-800">{READING_UI_TEXT.components.reader.QUIZ_UNAVAILABLE_TITLE}</p>
          <p className="text-xs text-slate-500">{READING_UI_TEXT.components.reader.QUIZ_UNAVAILABLE_DESC}</p>
        </div>
      </Card>
    );
  }

  // Render results state
  if (results) {
    const isPassing = results.score >= 80;
    return (
      <Card className="max-w-[750px] mx-auto border-slate-100/80 shadow-md overflow-hidden bg-white">
        <div className={cn(
          "p-6 text-white text-center space-y-2 flex flex-col items-center justify-center",
          isPassing 
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
        )}>
          <Award className="h-12 w-12 text-amber-300 animate-bounce" />
          <h3 className="font-extrabold text-xl font-serif">{READING_UI_TEXT.components.reader.QUIZ_RESULTS}</h3>
          <p className="text-sm font-medium opacity-90">
            {isPassing ? READING_UI_TEXT.components.reader.QUIZ_PASS_DESC : READING_UI_TEXT.components.reader.QUIZ_FAIL_DESC}
          </p>
          <div className="inline-flex bg-white/20 px-4 py-1.5 rounded-full text-base font-extrabold backdrop-blur-sm mt-1">
            {READING_UI_TEXT.components.reader.QUIZ_SCORE_LABEL}: {results.score}% ({results.correctCount}/{results.totalQuestions})
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          <h4 className="font-bold text-sm text-slate-800 border-b pb-2">{READING_UI_TEXT.components.reader.QUIZ_REVIEW}</h4>
          
          <div className="space-y-6">
            {results.results.map((res, index) => (
              <div key={res.questionId} className="space-y-2.5">
                <div className="flex gap-2 items-start">
                  <span className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500 flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-sm text-slate-800 leading-tight">{res.question}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">{READING_UI_TEXT.components.reader.QUIZ_YOUR_ANSWER}</span>
                      <span className={cn("text-xs font-bold flex items-center gap-1", res.isCorrect ? 'text-emerald-600' : 'text-red-500')}>
                        {res.isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {res.userAnswer || READING_UI_TEXT.components.reader.QUIZ_NO_ANSWER}
                      </span>
                    </div>
                    {!res.isCorrect && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400">{READING_UI_TEXT.components.reader.QUIZ_CORRECT_ANSWER}</span>
                        <span className="text-xs font-extrabold text-emerald-600">{res.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </div>

                {res.explanation && (
                  <div className="ml-7 p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs leading-relaxed text-slate-600 font-sans">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{READING_UI_TEXT.components.reader.QUIZ_EXPLANATION}</span>
                    {res.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-50">
            <Button
              onClick={handleRetry}
              className="font-bold text-xs bg-slate-900 text-white rounded gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> {READING_UI_TEXT.components.reader.QUIZ_TRY_AGAIN}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentIdx];
  const hasAnswered = selectedAnswers[currentQuestion.id] !== undefined;

  return (
    <Card className="max-w-[750px] mx-auto border-slate-100/80 shadow-md bg-white select-none">
      <CardHeader className="border-b border-slate-50 p-4 flex flex-row items-center justify-between">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
          <BookOpen className="h-4.5 w-4.5 text-blue-500" /> {READING_UI_TEXT.components.reader.QUIZ_CHECK}
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">
          {READING_UI_TEXT.components.reader.QUIZ_QUESTION_LABEL.replace('{current}', (currentIdx + 1).toString()).replace('{total}', questions.length.toString())}
        </span>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <h4 className="font-extrabold text-base text-slate-800 leading-snug">
            {currentQuestion.question}
          </h4>

          <RadioGroup 
            value={selectedAnswers[currentQuestion.id] || ''} 
            onValueChange={handleSelectAnswer}
            className="space-y-2.5"
          >
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedAnswers[currentQuestion.id] === opt;
              return (
                <div 
                  key={opt} 
                  className={cn(
                    "flex items-center gap-3 p-3 border rounded-xl transition-all cursor-pointer",
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/20 shadow-sm' 
                      : 'border-slate-200/80 hover:bg-slate-50/50 hover:border-slate-300'
                  )}
                  onClick={() => handleSelectAnswer(opt)}
                >
                  <RadioGroupItem value={opt} id={opt} className="text-blue-600" />
                  <Label htmlFor={opt} className="text-xs font-bold text-slate-700 cursor-pointer w-full leading-normal">
                    {opt}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="h-9 font-bold text-xs text-slate-600 border-slate-200 rounded disabled:opacity-50"
          >
            {READING_UI_TEXT.components.reader.QUIZ_BTN_PREVIOUS}
          </Button>

          {currentIdx === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!hasAnswered || submitting}
              className="h-9 font-bold text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> {READING_UI_TEXT.components.reader.QUIZ_SUBMITTING}
                </>
              ) : (
                READING_UI_TEXT.components.reader.QUIZ_BTN_SUBMIT
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!hasAnswered}
              className="h-9 font-bold text-xs bg-slate-900 text-white rounded hover:bg-slate-800 disabled:opacity-50 gap-1"
            >
              {READING_UI_TEXT.components.reader.QUIZ_BTN_NEXT} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
export default ArticleQuiz;
