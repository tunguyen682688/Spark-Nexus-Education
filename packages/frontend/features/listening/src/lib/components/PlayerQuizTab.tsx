import React from 'react';
import { Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { ListeningQuestion } from '../types';
import { LISTENING_WORKSPACE_TEXT } from '../constants';

interface PlayerQuizTabProps {
  questions?: ListeningQuestion[];
  selectedAnswers: Record<string, string>;
  onSelectAnswer: (questionId: string, option: string) => void;
  submittedAnswers: Record<string, boolean>;
  onSubmitAnswer: (questionId: string) => void;
  onPlayTimestamp: (startTime: number) => void;
}

export const PlayerQuizTab: React.FC<PlayerQuizTabProps> = ({
  questions = [],
  selectedAnswers,
  onSelectAnswer,
  submittedAnswers,
  onSubmitAnswer,
  onPlayTimestamp,
}) => {
  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-12">
      {questions.map((q, idx) => {
        const selectedOption = selectedAnswers[q.id];
        const isSubmitted = submittedAnswers[q.id];
        const isCorrect = isSubmitted && (
          !q.options || q.options.length === 0
            ? (selectedOption || '').trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
            : selectedOption === q.correctAnswer
        );

        return (
          <div
            key={q.id}
            className="p-6 bg-card/40 border border-border rounded-2xl shadow-md"
          >
            <div className="flex items-start justify-between mb-4 gap-4">
              <h3 className="text-base font-bold text-foreground leading-relaxed">
                {LISTENING_WORKSPACE_TEXT.PLAYER.QUESTION_INDEX(idx + 1)}: {q.questionText}
              </h3>

              {/* Question audio timestamp seeker */}
              {q.audioTimestamp !== undefined && q.audioTimestamp !== null && (
                <button
                  onClick={() => {
                    if (q.audioTimestamp !== undefined && q.audioTimestamp !== null) {
                      onPlayTimestamp(q.audioTimestamp);
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/90 bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {LISTENING_WORKSPACE_TEXT.PLAYER.REPLAY}
                </button>
              )}
            </div>

            {/* Options / Text Input for fill in the blanks */}
            {!q.options || q.options.length === 0 ? (
              <div className="space-y-3 mb-5">
                <input
                  type="text"
                  placeholder={LISTENING_WORKSPACE_TEXT.PLAYER.INPUT_PLACEHOLDER}
                  value={selectedOption || ''}
                  disabled={isSubmitted}
                  onChange={(e) => onSelectAnswer(q.id, e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground/60 focus:border-primary focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            ) : (
              <div className="space-y-3 mb-5">
                {q.options.map((opt) => {
                  const isSelected = selectedOption === opt;
                  const isOptionCorrectAnswer = opt === q.correctAnswer;
                  
                  let optionStyle = 'border-border hover:border-border/80 hover:bg-muted text-muted-foreground';
                  if (isSelected) {
                    optionStyle = 'border-primary bg-primary/10 text-primary';
                  }
                  if (isSubmitted) {
                    if (isOptionCorrectAnswer) {
                      optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
                    } else if (isSelected) {
                      optionStyle = 'border-red-500 bg-red-500/10 text-red-400';
                    } else {
                      optionStyle = 'border-border/60 text-muted-foreground opacity-60';
                    }
                  }

                  return (
                    <div
                      key={opt}
                      onClick={() => onSelectAnswer(q.id, opt)}
                      className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${optionStyle}`}
                    >
                      <span className="text-sm font-semibold">{opt}</span>
                      {isSubmitted && isOptionCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      {isSubmitted && isSelected && !isOptionCorrectAnswer && <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            {!isSubmitted ? (
              <button
                onClick={() => onSubmitAnswer(q.id)}
                disabled={!selectedOption || !selectedOption.trim()}
                className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold rounded-xl transition-all shadow-md shadow-primary/10"
              >
                {LISTENING_WORKSPACE_TEXT.PLAYER.CHECK_QUESTION}
              </button>
            ) : (
              /* Explanation block */
              <div className="p-4 bg-background border border-border rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <span className="text-emerald-400 font-bold text-xs bg-emerald-505/10 px-2 py-0.5 rounded border border-emerald-505/20">
                      {LISTENING_WORKSPACE_TEXT.PLAYER.CORRECT}
                    </span>
                  ) : (
                    <span className="text-red-400 font-bold text-xs bg-red-505/10 px-2 py-0.5 rounded border border-red-505/20">
                      {LISTENING_WORKSPACE_TEXT.PLAYER.INCORRECT}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {LISTENING_WORKSPACE_TEXT.PLAYER.CORRECT_ANSWER_LABEL}{' '}
                    <strong className="text-emerald-400">{q.correctAnswer}</strong>
                  </span>
                </div>
                {q.explanation && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>{LISTENING_WORKSPACE_TEXT.PLAYER.EXPLANATION_LABEL}</strong> {q.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PlayerQuizTab;
