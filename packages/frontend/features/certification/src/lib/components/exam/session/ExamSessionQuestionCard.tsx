import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, BookOpen, Mic, PenLine } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';

interface Choice {
  content?: string;
}

interface MatchingPair {
  left?: string;
  right?: string;
}

interface SubQuestion {
  id: string;
  blankNumber?: number;
  subQuestionNumber?: number;
  content?: string;
  choices?: (string | Choice)[];
}

interface ExamQuestion {
  id: string;
  content?: string;
  questionType?: string;
  category?: string;
  choices?: (string | Choice)[];
  matchingPairs?: MatchingPair[];
  modelAnswer?: string;
  passageText?: string;
  passageTitle?: string;
  passageType?: string;
  passageGroupId?: string;
  subQuestions?: SubQuestion[];
}

interface ExamSessionQuestionCardProps {
  currentQuestionIndex: number;
  questionsLength: number;
  currentQ: ExamQuestion | null;
  userAnswers: Record<string, string>;
  onSelectChoice: (choiceText: string) => void;
  onAnswerChange?: (questionId: string, answer: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

function MCQChoices({
  choices,
  selectedAnswer,
  onSelect,
}: {
  choices?: (string | Choice)[];
  selectedAnswer?: string;
  onSelect: (text: string) => void;
}) {
  if (!choices || choices.length === 0) return null;
  return (
    <div className="space-y-3">
      {choices.map((choice, idx) => {
        const choiceText = typeof choice === 'string' ? choice : choice.content;
        const isSelected = selectedAnswer === choiceText;
        return (
          <button
            key={idx}
            onClick={() => choiceText && onSelect(choiceText)}
            className={`w-full text-left p-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
              isSelected
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                : 'border-border hover:border-slate-400 bg-card text-foreground'
            }`}
          >
            <span>{choiceText}</span>
            {isSelected && (
              <CheckCircle className="w-4 h-4 text-indigo-600 fill-current" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function MatchingQuestion({
  pairs,
  selectedAnswers,
  onSelect,
}: {
  pairs?: MatchingPair[];
  selectedAnswers: Record<number, string>;
  onSelect: (leftIndex: number, rightValue: string) => void;
}) {
  if (!pairs || pairs.length === 0) return null;
  const leftItems = pairs.map(p => p.left || '');
  const rightItems = pairs.map(p => p.right || '');
  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-muted-foreground uppercase">Match items on the left with the right</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Items</p>
          {leftItems.map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-secondary/50 border border-border text-xs font-bold text-foreground">
              {item}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Matches</p>
          {rightItems.map((item, idx) => {
            const isSelected = selectedAnswers[idx] === item;
            return (
              <button
                key={idx}
                onClick={() => onSelect(idx, item)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-border hover:border-slate-400 bg-card'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InputAnswer({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-muted-foreground uppercase">Your Answer</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Type your answer here...'}
        className="w-full p-3 rounded-xl border border-border bg-card text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function WritingAnswer({
  value,
  onChange,
  placeholder,
  wordLimit,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  wordLimit?: number;
}) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
          <PenLine className="w-3 h-3" />
          Your Response
        </p>
        {wordLimit && (
          <span className={`text-[10px] font-bold ${wordCount >= wordLimit ? 'text-emerald-600' : 'text-muted-foreground'}`}>
            {wordCount}/{wordLimit} words
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder={placeholder || 'Write your response here...'}
        className="w-full p-3 rounded-xl border border-border bg-card text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none"
      />
    </div>
  );
}

function SpeakingAnswer({
  value,
  onChange,
  placeholder,
  timeLimit,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  timeLimit?: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
          <Mic className="w-3 h-3" />
          Your Response
        </p>
        {timeLimit && (
          <span className="text-[10px] font-bold text-muted-foreground">
            Time limit: {timeLimit}s
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder={placeholder || 'Record or type your response...'}
        className="w-full p-3 rounded-xl border border-border bg-card text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none"
      />
    </div>
  );
}

function PassageContext({
  passageText,
  passageTitle,
  passageType,
}: {
  passageText?: string;
  passageTitle?: string;
  passageType?: string;
}) {
  if (!passageText) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
        <span className="text-[10px] font-black text-indigo-600 uppercase">{passageTitle || 'Reading Passage'}</span>
        {passageType && (
          <span className="text-[9px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
            {passageType}
          </span>
        )}
      </div>
      <div className="text-xs text-foreground bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-200/50 dark:border-indigo-800/30 rounded-xl p-4 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
        {passageText}
      </div>
    </div>
  );
}

function SubQuestionCard({
  question,
  index,
  userAnswer,
  onAnswerChange,
}: {
  question: SubQuestion;
  index: number;
  userAnswer?: string;
  onAnswerChange: (answer: string) => void;
}) {
  const label = question.blankNumber ? `Blank ${question.blankNumber}` : `Question ${question.subQuestionNumber || index + 1}`;
  return (
    <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
      <p className="text-xs font-black text-indigo-600 uppercase">{label}</p>
      {question.content && (
        <p className="text-sm font-bold text-foreground leading-relaxed">{question.content}</p>
      )}
      <MCQChoices
        choices={question.choices}
        selectedAnswer={userAnswer}
        onSelect={onAnswerChange}
      />
    </div>
  );
}

export function ExamSessionQuestionCard({
  currentQuestionIndex,
  questionsLength,
  currentQ,
  userAnswers,
  onSelectChoice,
  onAnswerChange,
  onPrevious,
  onNext,
}: ExamSessionQuestionCardProps) {
  const [matchingAnswers, setMatchingAnswers] = useState<Record<number, string>>({});
  const [textInput, setTextInput] = useState('');

  if (!currentQ) {
    return (
      <Card className="border-border">
        <CardContent className="py-12 text-center text-muted-foreground">
          No question available
        </CardContent>
      </Card>
    );
  }

  const category = currentQ.category || 'choice';
  const isPassageGroup = !!currentQ.passageGroupId && !!currentQ.subQuestions?.length;

  const handleAnswerChange = (answer: string) => {
    if (onAnswerChange) {
      onAnswerChange(currentQ.id, answer);
    } else {
      onSelectChoice(answer);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold">
          Question {currentQuestionIndex + 1} of {questionsLength}
        </CardTitle>
        {currentQ.questionType && (
          <span className="text-[9px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {currentQ.questionType}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Passage context for passage groups */}
        {isPassageGroup && (
          <PassageContext
            passageText={currentQ.passageText}
            passageTitle={currentQ.passageTitle}
            passageType={currentQ.passageType}
          />
        )}

        {/* Question content (for non-passage-group types) */}
        {!isPassageGroup && currentQ.content && (
          <p className="text-sm sm:text-base font-extrabold text-foreground leading-relaxed">
            {currentQ.content}
          </p>
        )}

        {/* MCQ choices */}
        {category === 'choice' && !isPassageGroup && (
          <MCQChoices
            choices={currentQ.choices}
            selectedAnswer={userAnswers[currentQ.id]}
            onSelect={onSelectChoice}
          />
        )}

        {/* Matching pairs */}
        {category === 'matching' && (
          <MatchingQuestion
            pairs={currentQ.matchingPairs}
            selectedAnswers={matchingAnswers}
            onSelect={(idx, value) => {
              setMatchingAnswers(prev => ({ ...prev, [idx]: value }));
              handleAnswerChange(JSON.stringify({ ...matchingAnswers, [idx]: value }));
            }}
          />
        )}

        {/* Input/Grid-in */}
        {category === 'input' && (
          <InputAnswer
            value={userAnswers[currentQ.id] || textInput}
            onChange={(v) => {
              setTextInput(v);
              handleAnswerChange(v);
            }}
            placeholder={currentQ.modelAnswer ? 'Enter your answer...' : 'Type your answer...'}
          />
        )}

        {/* Gap-fill */}
        {category === 'gap-fill' && (
          <InputAnswer
            value={userAnswers[currentQ.id] || textInput}
            onChange={(v) => {
              setTextInput(v);
              handleAnswerChange(v);
            }}
            placeholder="Enter the missing word/phrase..."
          />
        )}

        {/* Writing */}
        {category === 'writing' && (
          <WritingAnswer
            value={userAnswers[currentQ.id] || ''}
            onChange={handleAnswerChange}
            placeholder="Write your response here..."
          />
        )}

        {/* Speaking */}
        {category === 'speaking' && (
          <SpeakingAnswer
            value={userAnswers[currentQ.id] || ''}
            onChange={handleAnswerChange}
            placeholder="Record or type your response..."
          />
        )}

        {/* Passage group sub-questions */}
        {isPassageGroup && currentQ.subQuestions && (
          <div className="space-y-4">
            {currentQ.subQuestions.map((sq, idx) => (
              <SubQuestionCard
                key={sq.id}
                question={sq}
                index={idx}
                userAnswer={userAnswers[sq.id]}
                onAnswerChange={(answer) => {
                  if (onAnswerChange) {
                    onAnswerChange(sq.id, answer);
                  } else {
                    onSelectChoice(answer);
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Button
            disabled={currentQuestionIndex === 0}
            onClick={onPrevious}
            variant="outline"
            size="sm"
            className="text-xs font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> {CERTIFICATION_UI_TEXT.examSession.previousQuestion}
          </Button>

          <Button
            disabled={currentQuestionIndex === questionsLength - 1}
            onClick={onNext}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            {CERTIFICATION_UI_TEXT.examSession.nextQuestion} <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
