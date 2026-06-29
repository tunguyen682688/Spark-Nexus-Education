import { useState, FormEvent } from 'react';
import { X, Lightbulb } from 'lucide-react';
import { Input, Textarea } from '@spark-nest-ed/frontend-shared-components';
import { toast } from 'sonner';
import { GRAMMAR_UI_TEXT } from '../../constants';
import { useSubmitCrowdsourcedQuiz } from '../../hooks';
import type { CrowdsourcedQuiz } from '../../types';

const T = GRAMMAR_UI_TEXT.crowdsourcedQuizForm;

interface CrowdsourcedQuizFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CrowdsourcedQuizForm({ isOpen, onClose }: CrowdsourcedQuizFormProps) {
  const [contribLessonId, setContribLessonId] = useState('relative-clauses');
  const [contribType, setContribType] = useState<'SENTENCE_BUILDER' | 'ERROR_SPOTLIGHT'>('SENTENCE_BUILDER');
  const [contribQuestion, setContribQuestion] = useState('');
  const [contribExplanation, setContribExplanation] = useState('');
  
  // Dành cho Sentence Builder
  const [wordsInput, setWordsInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  
  // Dành cho Error Spotlight
  const [sentenceInput, setSentenceInput] = useState('');
  const [incorrectWordInput, setIncorrectWordInput] = useState('');
  const [correctWordInput, setCorrectWordInput] = useState('');

  const submitQuizMutation = useSubmitCrowdsourcedQuiz();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contribQuestion || !contribExplanation) return;

    let questionData: CrowdsourcedQuiz['questionData'] = {};
    if (contribType === 'SENTENCE_BUILDER') {
      questionData = {
        words: wordsInput.split(',').map(w => w.trim()).filter(Boolean),
        answer: answerInput.trim(),
      };
    } else {
      questionData = {
        sentence: sentenceInput.trim(),
        incorrectWord: incorrectWordInput.trim(),
        correctWord: correctWordInput.trim(),
      };
    }

    submitQuizMutation.mutate({
      lessonId: contribLessonId,
      payload: {
        questionType: contribType,
        questionData,
        explanation: contribExplanation,
      }
    }, {
      onSuccess: (res: { success: boolean; status: string; message: string; data: unknown }) => {
        toast.success(res?.message || 'Đóng góp thành công!');
        onClose();
        setContribQuestion('');
        setContribExplanation('');
        setWordsInput('');
        setAnswerInput('');
        setSentenceInput('');
        setIncorrectWordInput('');
        setCorrectWordInput('');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border p-6 flex items-center justify-between z-20">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              {T.title}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">{T.subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted text-muted-foreground rounded-full transition bg-transparent border-none cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.labelLesson}</label>
              <select
                value={contribLessonId}
                onChange={(e) => setContribLessonId(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary transition cursor-pointer"
              >
                <option value="relative-clauses">{T.lessonRelativeClauses}</option>
                <option value="conditionals">{T.lessonConditionals}</option>
                <option value="passive-voice">{T.lessonPassiveVoice}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.labelExerciseType}</label>
              <select
                value={contribType}
                onChange={(e) => setContribType(e.target.value as 'SENTENCE_BUILDER' | 'ERROR_SPOTLIGHT')}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary transition cursor-pointer"
              >
                <option value="SENTENCE_BUILDER">{T.typeSentenceBuilder}</option>
                <option value="ERROR_SPOTLIGHT">{T.typeErrorSpotlight}</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.labelQuestion}</label>
            <Input
              type="text"
              required
              value={contribQuestion}
              onChange={(e) => setContribQuestion(e.target.value)}
              placeholder={T.placeholderQuestion}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary transition"
            />
          </div>

          {contribType === 'SENTENCE_BUILDER' && (
            <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase tracking-wider">{T.labelShuffledWords}</label>
                <Input
                  type="text"
                  required
                  value={wordsInput}
                  onChange={(e) => setWordsInput(e.target.value)}
                  placeholder={T.placeholderShuffledWords}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase tracking-wider">{T.labelCorrectAnswer}</label>
                <Input
                  type="text"
                  required
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder={T.placeholderCorrectAnswer}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary transition"
                />
              </div>
            </div>
          )}

          {contribType === 'ERROR_SPOTLIGHT' && (
            <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase tracking-wider">{T.labelErrorSentence}</label>
                <Input
                  type="text"
                  required
                  value={sentenceInput}
                  onChange={(e) => setSentenceInput(e.target.value)}
                  placeholder={T.placeholderErrorSentence}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider">{T.labelIncorrectWord}</label>
                  <Input
                    type="text"
                    required
                    value={incorrectWordInput}
                    onChange={(e) => setIncorrectWordInput(e.target.value)}
                    placeholder={T.placeholderIncorrectWord}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider">{T.labelCorrectWord}</label>
                  <Input
                    type="text"
                    required
                    value={correctWordInput}
                    onChange={(e) => setCorrectWordInput(e.target.value)}
                    placeholder={T.placeholderCorrectWord}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary transition"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex justify-between">
              {T.labelExplanation}
              <span className="text-[10px] text-muted-foreground normal-case font-normal">{T.hintExplanation}</span>
            </label>
            <Textarea
              required
              rows={3}
              value={contribExplanation}
              onChange={(e) => setContribExplanation(e.target.value)}
              placeholder={T.placeholderExplanation}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary transition resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-muted-foreground bg-muted hover:bg-muted/80 transition border border-border cursor-pointer"
            >
              {T.btnCancel}
            </button>
            <button
              type="submit"
              disabled={submitQuizMutation.isPending}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 transition shadow-lg cursor-pointer border-none"
            >
              {submitQuizMutation.isPending ? T.btnSubmitting : T.btnSubmit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
