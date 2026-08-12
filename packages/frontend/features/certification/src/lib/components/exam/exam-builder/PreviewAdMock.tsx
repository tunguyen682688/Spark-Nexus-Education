import { Check } from 'lucide-react';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';
import type { AnswerOptionItem } from '../../../hooks/container-logic/exam/use-question-builder-container-logic';

interface PreviewAdMockProps {
  questionText: string;
  questionNumber?: number;
  options: AnswerOptionItem[];
  viewport: 'desktop' | 'mobile';
}

export function PreviewAdMock({ questionText, questionNumber = 1, options, viewport }: PreviewAdMockProps) {
  const previewAdText = CERTIFICATION_UI_TEXT.questionBuilder.previewAd;

  return (
    <div
      className={`bg-indigo-50/40 dark:bg-indigo-950/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/40 space-y-4 mx-auto ${
        viewport === 'mobile' ? 'max-w-xs' : 'w-full'
      }`}
    >
      <div className="bg-card border border-border rounded-xl p-4 text-center space-y-2 shadow-sm">
        <span className="text-[10px] text-muted-foreground font-bold block text-left">
          {previewAdText.label}
        </span>

        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center mx-auto shadow-md">
          {previewAdText.appName}
        </div>

        <h4 className="font-black text-sm text-foreground">
          {previewAdText.headline}
        </h4>

        <div className="text-[10px] text-muted-foreground font-semibold space-y-1 text-left max-w-xs mx-auto">
          {previewAdText.features.map((feature) => (
            <div key={feature} className="flex items-center gap-1 text-emerald-600">
              <Check className="w-3 h-3" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <button className="mt-2 text-[10px] font-extrabold text-indigo-600 hover:underline">
          {previewAdText.cta}
        </button>
      </div>

      <div className="space-y-3 pt-2">
        <div className="text-xs font-extrabold text-foreground leading-snug">
          {questionNumber}. {questionText}
        </div>

        <div className="space-y-2 text-xs font-semibold">
          {options.map((opt) => (
            <div
              key={opt.id}
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-colors ${
                opt.isCorrect
                  ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-foreground'
                  : 'border-border bg-card text-muted-foreground'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  opt.isCorrect
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-muted-foreground/40'
                }`}
              >
                {opt.isCorrect && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span>
                {opt.label}. {opt.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
