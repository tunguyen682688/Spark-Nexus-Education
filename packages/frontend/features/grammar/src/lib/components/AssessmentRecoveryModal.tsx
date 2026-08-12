import { FC } from 'react';
import { RotateCcw, Timer } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { GRAMMAR_UI_TEXT } from '../constants';

interface AssessmentRecoveryModalProps {
  onRecover: () => void;
  onDiscard: () => void;
}

export const AssessmentRecoveryModal: FC<AssessmentRecoveryModalProps> = ({
  onRecover,
  onDiscard,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
    <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl shadow-blue-500/5 space-y-6 text-center overflow-hidden">
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-blue-600/10 blur-2xl pointer-events-none" />
      <div className="mx-auto h-14 w-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center animate-pulse">
        <Timer className="h-7 w-7 text-blue-400" />
      </div>
      <div className="space-y-2">
        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
          {GRAMMAR_UI_TEXT.assessmentEngine.stateRecoveryLabel}{' '}
          <span role="img" aria-label="hourglass-flowing-sand">⏳</span>
        </span>
        <h3 className="text-xl font-extrabold text-foreground pt-1">{GRAMMAR_UI_TEXT.assessmentEngine.recoveryTitle}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{GRAMMAR_UI_TEXT.assessmentEngine.recoveryDesc}</p>
      </div>
      <div className="flex flex-col gap-2 pt-2">
        <Button onClick={onRecover}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3 rounded-xl border-none shadow-lg shadow-blue-500/20 text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider active:scale-98">
          <RotateCcw className="h-4 w-4" /> {GRAMMAR_UI_TEXT.assessmentEngine.btnRecover}
        </Button>
        <Button onClick={onDiscard}
          className="w-full bg-muted hover:bg-secondary text-rose-450 hover:text-rose-400 font-extrabold py-3 rounded-xl border border-border text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider active:scale-98">
          {GRAMMAR_UI_TEXT.assessmentEngine.btnDiscard}
        </Button>
      </div>
    </div>
  </div>
);
