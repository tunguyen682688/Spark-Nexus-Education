import { FC, ChangeEvent, KeyboardEvent } from 'react';
import { Check, X, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button, Input } from '@spark-nest-ed/frontend-shared-components';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import type { ExamQuestion } from '../types';
import { GRAMMAR_UI_TEXT } from '../constants';

interface AssessmentQuestionRendererProps {
  question: ExamQuestion;
  qType: 'MULTIPLE_CHOICE' | 'SENTENCE_BUILDER' | 'ERROR_SPOTLIGHT';
  selectedOpt: string | null;
  selectedWords: string[];
  selectedErrorWord: string | null;
  correctedText: string;
  isAnswered: boolean;
  isCorrect: boolean | null;
  onSelectOption: (opt: string) => void;
  onWordClick: (word: string) => void;
  onRemoveWord: (idx: number) => void;
  onClearWords: () => void;
  onCheckSentenceBuilder: () => void;
  onSelectErrorWord: (word: string) => void;
  onCorrectionChange: (text: string) => void;
  onCheckErrorSpotlight: () => void;
}

export const AssessmentQuestionRenderer: FC<AssessmentQuestionRendererProps> = ({
  question, qType, selectedOpt, selectedWords, selectedErrorWord, correctedText,
  isAnswered, isCorrect, onSelectOption, onWordClick, onRemoveWord, onClearWords,
  onCheckSentenceBuilder, onSelectErrorWord, onCorrectionChange, onCheckErrorSpotlight,
}) => (
  <div className="space-y-5">
    <div className="space-y-1">
      <span className="text-[9px] font-bold text-primary uppercase tracking-widest px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
        {qType === 'SENTENCE_BUILDER' ? 'Sentence Rebuilder 🧩' : qType === 'ERROR_SPOTLIGHT' ? 'Error Spotlight 🔍' : 'Multiple Choice 📝'}
      </span>
      <h3 className="text-base font-bold text-foreground leading-relaxed pt-2">{question.text}</h3>
    </div>

    {qType === 'MULTIPLE_CHOICE' && question.options && (
      <div className="grid grid-cols-1 gap-3">
        {question.options.map((opt: string) => {
          const isSelected = selectedOpt === opt;
          const isCorrectAnswer = opt === question.answer;
          let cardStyles = 'bg-card border-border hover:border-muted-foreground/30 text-foreground';
          let animationStyles = '';
          if (isAnswered) {
            if (isCorrectAnswer) { cardStyles = 'bg-emerald-500/10 border-emerald-500/35 text-emerald-500'; if (isSelected) animationStyles = 'shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-[1.01]'; }
            else if (isSelected) { cardStyles = 'bg-destructive/10 border-destructive/35 text-destructive'; animationStyles = 'animate-[shake_0.4s_ease-in-out]'; }
            else { cardStyles = 'bg-card/20 border-border text-muted-foreground opacity-40'; }
          } else if (isSelected) { cardStyles = 'bg-primary/10 border-primary/30 text-primary'; }
          return (
            <button key={opt} disabled={isAnswered} onClick={() => onSelectOption(opt)}
              className={cn("w-full text-left rounded-2xl border px-5 py-4 text-sm font-bold flex items-center justify-between transition-all group",
                !isAnswered ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]' : 'cursor-default', cardStyles, animationStyles)}>
              <span>{opt}</span>
              {isAnswered && isCorrectAnswer && <CheckCircle className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />}
              {isAnswered && isSelected && !isCorrectAnswer && <XCircle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    )}

    {qType === 'SENTENCE_BUILDER' && question.words && (
      <div className="space-y-4">
        <div className={`min-h-[64px] p-4 bg-muted/30 border rounded-2xl flex flex-wrap gap-2 items-center transition-all ${isAnswered ? isCorrect ? 'border-emerald-500/35 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-rose-500/35 bg-rose-500/5 animate-[shake_0.4s_ease-in-out]' : 'border-border'}`}>
          {selectedWords.length === 0 ? (
            <span className="text-xs font-medium text-muted-foreground/60">{GRAMMAR_UI_TEXT.assessmentQuiz.clickWordToBuild}</span>
          ) : selectedWords.map((word, idx) => (
            <button key={`${word}-${idx}`} disabled={isAnswered} onClick={() => onRemoveWord(idx)}
              className={`bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${!isAnswered ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`}>
              {word} {!isAnswered && <X className="h-3 w-3 text-primary" />}
            </button>
          ))}
        </div>
        {!isAnswered && selectedWords.length > 0 && (
          <div className="flex justify-end gap-2">
            <button onClick={onClearWords} className="bg-muted hover:bg-muted/80 text-foreground text-[10px] font-bold px-3 py-1.5 rounded-lg border border-border flex items-center gap-1 cursor-pointer transition">
              <RefreshCw className="h-3 w-3" /> {GRAMMAR_UI_TEXT.assessmentQuiz.btnClearAll}
            </button>
          </div>
        )}
        {!isAnswered && (
          <div className="bg-muted/20 p-4 border border-border rounded-2xl space-y-3">
            <span className="text-[10px] font-black text-muted-foreground tracking-wider uppercase block">{GRAMMAR_UI_TEXT.assessmentQuiz.wordPool}</span>
            <div className="flex flex-wrap gap-2">
              {question.words.map((word: string, idx: number) => {
                const countInSelected = selectedWords.filter((w) => w === word).length;
                const countInOriginal = question.words?.filter((w: string) => w === word).length || 0;
                const isUsedUp = countInSelected >= countInOriginal;
                return (
                  <button key={`${word}-avail-${idx}`} disabled={isUsedUp} onClick={() => onWordClick(word)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl transition ${isUsedUp ? 'bg-muted text-muted-foreground/40 border border-border opacity-25 cursor-default' : 'bg-muted hover:bg-muted/80 border border-border text-foreground cursor-pointer hover:scale-105 active:scale-95'}`}>
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {!isAnswered && selectedWords.length > 0 && (
          <div className="pt-2 flex justify-end">
            <Button onClick={onCheckSentenceBuilder}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs px-6 py-2.5 rounded-xl border-none shadow-md shadow-primary/15 flex items-center gap-1.5 cursor-pointer transition active:scale-95 uppercase tracking-wider">
              <Check className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentQuiz.btnCheckSentence}
            </Button>
          </div>
        )}
      </div>
    )}

    {qType === 'ERROR_SPOTLIGHT' && question.sentence && (
      <div className="space-y-4">
        <div className="bg-muted/20 border border-border rounded-2xl p-6 text-center space-y-4">
          <span className="text-[10px] font-black text-muted-foreground tracking-wider uppercase block">{GRAMMAR_UI_TEXT.assessmentQuiz.clickErrorWord}</span>
          <div className="flex flex-wrap justify-center gap-2.5">
            {question.sentence.split(' ').map((word: string, idx: number) => {
              const cleanWord = word.replace(/[.,!?;]/g, '');
              const isSelected = selectedErrorWord === cleanWord;
              const isCorrectTarget = cleanWord.toLowerCase() === question.incorrectWord?.toLowerCase();
              let wordStyles = 'bg-muted hover:bg-muted/80 border border-border text-foreground';
              if (isSelected) {
                if (isAnswered) { wordStyles = isCorrectTarget ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-black' : 'bg-destructive/10 border-destructive/40 text-destructive animate-[shake_0.4s_ease-in-out] font-black'; }
                else { wordStyles = 'bg-primary/10 border-primary text-primary font-extrabold scale-105'; }
              } else if (isAnswered && isCorrectTarget) { wordStyles = 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'; }
              return (
                <button key={`${word}-${idx}`} type="button" disabled={isAnswered} onClick={() => onSelectErrorWord(word)}
                  className={`text-sm font-bold px-3 py-2 rounded-xl transition ${!isAnswered ? 'cursor-pointer hover:scale-110 active:scale-90' : 'cursor-default'} ${wordStyles}`}>
                  {word}
                </button>
              );
            })}
          </div>
        </div>
        {selectedErrorWord && (
          <div className={`p-5 bg-card border rounded-2xl space-y-3 transition-all ${isAnswered ? isCorrect ? 'border-emerald-500/35 bg-emerald-500/5' : 'border-rose-500/35 bg-rose-500/5' : 'border-border'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-muted-foreground tracking-wider uppercase">
                {GRAMMAR_UI_TEXT.assessmentQuiz.wrongWordLabel} <span className="text-primary font-extrabold">{selectedErrorWord}</span>
              </span>
              {isAnswered && (
                <span className="text-xs font-bold text-muted-foreground">
                  {GRAMMAR_UI_TEXT.assessmentQuiz.correctWordLabel} <span className="text-emerald-500">{question.correctWord}</span>
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Input type="text" disabled={isAnswered} placeholder={GRAMMAR_UI_TEXT.assessmentQuiz.placeholderCorrection}
                value={correctedText} onChange={(e: ChangeEvent<HTMLInputElement>) => onCorrectionChange(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && onCheckErrorSpotlight()}
                className="flex-1 bg-background border border-border focus-visible:ring-primary/50 rounded-xl px-4 py-2.5 h-10 text-xs font-bold text-foreground transition" />
              {!isAnswered && (
                <Button onClick={onCheckErrorSpotlight} disabled={!correctedText}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl border-none shadow-md shadow-primary/10 transition active:scale-95 flex items-center gap-1.5 cursor-pointer">
                  <Check className="h-3.5 w-3.5" /> {GRAMMAR_UI_TEXT.assessmentQuiz.btnCheck}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);
