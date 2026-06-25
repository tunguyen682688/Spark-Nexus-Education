import React from 'react';
import { Volume2, CheckCircle2, XCircle, Info } from 'lucide-react';
import { LISTENING_WORKSPACE_TEXT } from '../constants';
import { ListeningQuestion } from '../types';

interface QuizQuestionsListProps {
  questions: ListeningQuestion[];

  selectedAnswers: Record<string, string>;
  submittedAnswers: Record<string, boolean>;
  handleReplaySegment: (time: number) => void;
  handleSelectOption: (id: string, opt: string) => void;
  handleSubmitAnswer: (id: string) => void;
}

export const QuizQuestionsList: React.FC<QuizQuestionsListProps> = ({
  questions,
  selectedAnswers,
  submittedAnswers,
  handleReplaySegment,
  handleSelectOption,
  handleSubmitAnswer,
}) => {
  const text = LISTENING_WORKSPACE_TEXT.QUIZ;

  return (
    <div className="flex-1 overflow-y-auto pr-1 space-y-6 custom-scrollbar h-full pb-12">
      {questions.length > 0 ? (
        questions.map((q, idx) => {
          const selectedOption = selectedAnswers[q.id];
          const isSubmitted = submittedAnswers[q.id];
          const isCorrect =
            isSubmitted &&
            (!q.options || q.options.length === 0
              ? (selectedOption || '').trim().toLowerCase() ===
                q.correctAnswer.trim().toLowerCase()
              : selectedOption === q.correctAnswer);

          return (
            <div
              key={q.id}
              className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md space-y-4"
            >
              {/* Question header */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-202 leading-relaxed">
                  {text.QUESTION_LABEL(idx + 1)}: {q.questionText}
                </h3>

                {/* Audio Timestamp trigger */}
                {q.audioTimestamp !== undefined &&
                  q.audioTimestamp !== null && (
                    <button
                      onClick={() => {
                        if (q.audioTimestamp !== undefined && q.audioTimestamp !== null) {
                          handleReplaySegment(q.audioTimestamp);
                        }
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-white bg-purple-500/10 border border-purple-500/20 hover:bg-purple-650 hover:border-purple-500 px-3 py-1.5 rounded-lg shrink-0 transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      {text.REPEAT_BUTTON}
                    </button>
                  )}
              </div>

              {/* Options */}
              {!q.options || q.options.length === 0 ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder={text.INPUT_PLACEHOLDER}
                    value={selectedOption || ''}
                    disabled={isSubmitted}
                    onChange={(e) =>
                      handleSelectOption(q.id, e.target.value)
                    }
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-202 placeholder-slate-655 focus:border-purple-500 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {q.options.map((opt) => {
                    const isSelected = selectedOption === opt;
                    const isOptionCorrectAnswer = opt === q.correctAnswer;

                    let optionStyle =
                      'border-slate-800/80 hover:border-slate-700 bg-slate-955/20 text-slate-350';
                    if (isSelected) {
                      optionStyle =
                        'border-purple-500 bg-purple-500/10 text-purple-300';
                    }
                    if (isSubmitted) {
                      if (isOptionCorrectAnswer) {
                        optionStyle =
                          'border-emerald-500 bg-emerald-500/10 text-emerald-455 font-semibold';
                      } else if (isSelected) {
                        optionStyle =
                          'border-red-500 bg-red-500/10 text-red-400';
                      } else {
                        optionStyle =
                          'border-slate-900 text-slate-600 opacity-50';
                      }
                    }

                    return (
                      <div
                        key={opt}
                        onClick={() => handleSelectOption(q.id, opt)}
                        className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${optionStyle}`}
                      >
                        <span className="text-xs sm:text-sm font-semibold">
                          {opt}
                        </span>
                        {isSubmitted && isOptionCorrectAnswer && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        )}
                        {isSubmitted &&
                          isSelected &&
                          !isOptionCorrectAnswer && (
                            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                          )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Submit actions & explanations */}
              {!isSubmitted ? (
                <button
                  onClick={() => handleSubmitAnswer(q.id)}
                  disabled={!selectedOption || !selectedOption.trim()}
                  className="w-full py-2.5 bg-purple-650 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-purple-650/15"
                >
                  {text.CHECK_BUTTON}
                </button>
              ) : (
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {isCorrect ? (
                      <span className="text-emerald-400 font-extrabold text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {text.RESULT_CORRECT}
                      </span>
                    ) : (
                      <span className="text-red-400 font-extrabold text-[10px] bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {text.RESULT_INCORRECT}
                      </span>
                    )}
                    <span className="text-xs text-slate-505">
                      {text.RESULT_ANSWER_LABEL}{' '}
                      <strong className="text-emerald-400 font-bold">
                        {q.correctAnswer}
                      </strong>
                    </span>
                  </div>
                  {q.explanation && (
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                      <strong>{text.RESULT_EXPLANATION}</strong> {q.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-center py-32 bg-slate-900/20 border border-slate-800 rounded-2xl text-slate-505">
          <Info className="w-12 h-12 mx-auto text-slate-700 mb-3" />
          <p className="text-sm font-medium">
            {LISTENING_WORKSPACE_TEXT.COMMON.EMPTY_QUESTIONS}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizQuestionsList;
