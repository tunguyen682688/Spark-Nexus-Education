import React from 'react';
import {
  Music,
  Pause,
  Play,
  HelpCircle,
  Plus,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { LISTENING_CONTRIBUTE_TEXT } from '../constants';
import { QuizQuestion } from '../hooks';

interface ContributeQuestionsStepProps {
  title: string;
  duration: number;
  audioTime: number;
  audioDuration: number;
  audioPlaying: boolean;
  questions: QuizQuestion[];
  togglePlayback: () => void;
  seekTo: (time: number) => void;
  formatDuration: (sec: number) => string;
  handleAddQuestion: () => void;
  handleRemoveQuestion: (id: string) => void;
  handleUpdateQuestion: (id: string, updates: Partial<QuizQuestion>) => void;
  handleGhimQuestionAudioTimestamp: (id: string) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export const ContributeQuestionsStep: React.FC<ContributeQuestionsStepProps> = ({
  title,
  duration,
  audioTime,
  audioDuration,
  audioPlaying,
  questions,
  togglePlayback,
  seekTo,
  formatDuration,
  handleAddQuestion,
  handleRemoveQuestion,
  handleUpdateQuestion,
  handleGhimQuestionAudioTimestamp,
  onPrevStep,
  onNextStep,
}) => {
  const text = LISTENING_CONTRIBUTE_TEXT.STEP_3_QUIZ;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column */}
      <div className="lg:col-span-1 bg-card border border-border rounded-3xl p-5 space-y-4 self-start backdrop-blur-md">
        <h3 className="text-xs font-black uppercase text-primary flex items-center gap-2">
          <Music className="w-4.5 h-4.5" />
          {LISTENING_CONTRIBUTE_TEXT.STEP_2_STUDIO.STUDIO_TITLE}
        </h3>

        <div className="bg-background border border-border p-4 rounded-2xl flex flex-col gap-4 text-center items-center justify-center">
          <span className="text-xs font-bold truncate max-w-xs text-muted-foreground">{title || text.DEFAULT_TITLE}</span>
          
          <div className="flex items-center gap-1.5 text-foreground font-mono text-lg font-bold">
            <span>{formatDuration(audioTime)}</span>
            <span className="text-muted-foreground/60">/</span>
            <span>{formatDuration(audioDuration || duration)}</span>
          </div>

          <input
            type="range"
            min="0"
            max={audioDuration || duration}
            step="1"
            value={audioTime}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="w-full accent-primary bg-muted h-1 rounded-full cursor-pointer"
          />

          <button
            onClick={togglePlayback}
            className="p-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
          >
            {audioPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-[11px] leading-relaxed">
          <span className="font-extrabold text-emerald-400 block uppercase">{text.SYNC_BOX_TITLE}</span>
          <p className="text-muted-foreground mt-1">
            {text.SYNC_BOX_DESC}
          </p>
        </div>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h2 className="text-sm font-black uppercase text-primary flex items-center gap-2">
              <HelpCircle className="w-4.5 h-4.5" />
              {text.EDITOR_TITLE}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">{text.EDITOR_DESC}</p>
          </div>
          
          <button
            onClick={handleAddQuestion}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold self-start"
          >
            <Plus className="w-4 h-4" /> {text.ADD_QUESTION_CTA}
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
          {questions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground font-bold text-xs bg-background/25 border border-dashed border-border rounded-2xl">
              {text.EMPTY_LIST}
            </div>
          ) : (
            questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-5 bg-background/50 border border-border rounded-2xl space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-extrabold uppercase">
                  
                  <span className="px-3 py-1 rounded bg-muted border border-border text-foreground">
                    {text.QUESTION_LABEL(q.order)}
                  </span>

                  <div className="flex items-center gap-3">
                    
                    <div className="flex items-center gap-1.5 border-r border-border pr-3">
                      <span className="text-muted-foreground">{text.TYPE_LABEL}</span>
                      <select
                        value={q.type}
                        onChange={(e) => handleUpdateQuestion(q.id, { type: e.target.value as 'multiple-choice' | 'gap-fill' })}
                        className="bg-background border border-border text-foreground text-[10px] rounded px-2 py-0.5 focus:outline-none"
                      >
                        <option value="multiple-choice">{text.TYPE_MULTIPLE_CHOICE}</option>
                        <option value="gap-fill">{text.TYPE_GAP_FILL}</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1 bg-background border border-border rounded px-2 py-0.5">
                      <span className="text-muted-foreground lowercase">{text.TIMESTAMP_LABEL}</span>
                      <span className="font-mono text-foreground">{q.audioTimestamp}s</span>
                      <button
                        type="button"
                        onClick={() => handleGhimQuestionAudioTimestamp(q.id)}
                        className="text-primary hover:text-primary/80 ml-1.5 font-bold lowercase text-[9px] border border-primary/25 px-1 rounded bg-primary/5"
                      >
                        {text.GHIM_CTA}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="p-1 rounded border border-border bg-background text-muted-foreground hover:text-red-400 hover:border-red-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="space-y-1.5 text-xs font-bold">
                  <label className="text-muted-foreground">{text.QUESTION_TEXT_LABEL}</label>
                  <input
                    type="text"
                    required
                    placeholder={text.QUESTION_TEXT_PLACEHOLDER}
                    value={q.questionText}
                    onChange={(e) => handleUpdateQuestion(q.id, { questionText: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none"
                  />
                </div>

                {/* Options */}
                {q.type === 'multiple-choice' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {['A', 'B', 'C', 'D'].map((opt, optIdx) => (
                      <div key={opt} className="flex items-center gap-2">
                        <span className="text-muted-foreground font-extrabold">{opt}:</span>
                        <input
                          type="text"
                          placeholder={text.OPTION_PLACEHOLDER(opt)}
                          value={q.options[optIdx] || ''}
                          onChange={(e) => {
                            const newOptions = [...q.options];
                            newOptions[optIdx] = e.target.value;
                            handleUpdateQuestion(q.id, { options: newOptions });
                          }}
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Correct Answer & Explanation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  
                  <div className="space-y-1.5">
                    <label className="text-muted-foreground">{text.CORRECT_ANSWER_LABEL}</label>
                    {q.type === 'multiple-choice' ? (
                      <select
                        value={q.correctAnswer}
                        onChange={(e) => handleUpdateQuestion(q.id, { correctAnswer: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none"
                      >
                        <option value="">{text.CORRECT_ANSWER_SELECT_PLACEHOLDER}</option>
                        <option value="A">{text.CORRECT_ANSWER_SELECT_OPTION('A')}</option>
                        <option value="B">{text.CORRECT_ANSWER_SELECT_OPTION('B')}</option>
                        <option value="C">{text.CORRECT_ANSWER_SELECT_OPTION('C')}</option>
                        <option value="D">{text.CORRECT_ANSWER_SELECT_OPTION('D')}</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder={text.CORRECT_ANSWER_INPUT_PLACEHOLDER}
                        value={q.correctAnswer}
                        onChange={(e) => handleUpdateQuestion(q.id, { correctAnswer: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-foreground focus:outline-none"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-muted-foreground">{text.EXPLANATION_LABEL}</label>
                    <input
                      type="text"
                      placeholder={text.EXPLANATION_PLACEHOLDER}
                      value={q.explanation}
                      onChange={(e) => handleUpdateQuestion(q.id, { explanation: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-foreground focus:outline-none"
                    />
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            onClick={onPrevStep}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground font-bold"
          >
            {text.BACK_CTA}
          </button>
          <button
            onClick={onNextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold active:scale-98 transition-all"
          >
            {text.CONTINUE_CTA}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default ContributeQuestionsStep;
