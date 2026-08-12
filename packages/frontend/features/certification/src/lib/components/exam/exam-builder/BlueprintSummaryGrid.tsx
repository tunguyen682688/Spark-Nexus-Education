import { Headphones, BookOpen, PenTool, Mic, Calculator, Clock } from 'lucide-react';

interface BlueprintSummaryGridProps {
  totalQuestions: number;
  durationText: string;
  totalPoints: number;
  variant?: 'compact' | 'large';
}

export function BlueprintSummaryGrid({ totalQuestions, durationText, totalPoints, variant = 'compact' }: BlueprintSummaryGridProps) {
  const sizeClass = variant === 'large' ? 'text-xl' : 'text-sm';
  const paddingClass = variant === 'large' ? 'p-4' : 'p-2.5';

  return (
    <div className={`grid grid-cols-3 gap-2 text-center ${paddingClass} bg-secondary/30 rounded-xl`}>
      <div>
        <span className={`text-muted-foreground font-bold uppercase block ${variant === 'large' ? 'text-[10px]' : 'text-[9px]'}`}>
          Questions
        </span>
        <span className={`${sizeClass} font-black text-foreground`}>
          {totalQuestions}
        </span>
      </div>
      <div>
        <span className={`text-muted-foreground font-bold uppercase block ${variant === 'large' ? 'text-[10px]' : 'text-[9px]'}`}>
          Time
        </span>
        <span className={`${sizeClass} font-black text-foreground`}>
          {durationText}
        </span>
      </div>
      <div>
        <span className={`text-muted-foreground font-bold uppercase block ${variant === 'large' ? 'text-[10px]' : 'text-[9px]'}`}>
          Points
        </span>
        <span className={`${sizeClass} font-black text-foreground`}>
          {totalPoints}
        </span>
      </div>
    </div>
  );
}

interface BlueprintLanguageRowProps {
  type: 'listening' | 'reading' | 'writing' | 'speaking' | 'math' | 'break';
  questions: number;
  timeMinutes: number;
}

export function BlueprintLanguageRow({ type, questions, timeMinutes }: BlueprintLanguageRowProps) {
  const icons = { listening: Headphones, reading: BookOpen, writing: PenTool, speaking: Mic, math: Calculator, break: Clock };
  const colors = {
    listening: 'text-blue-500',
    reading: 'text-emerald-500',
    writing: 'text-amber-500',
    speaking: 'text-rose-500',
    math: 'text-purple-500',
    break: 'text-slate-500',
  };
  const labels = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking', math: 'Math', break: 'Break' };
  const Icon = icons[type];

  return (
    <div className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
      <div className="flex items-center gap-2">
        <Icon className={`w-3.5 h-3.5 ${colors[type]}`} />
        <span className="text-foreground">{labels[type]}</span>
      </div>
      <div className="text-muted-foreground text-[11px]">
        {type === 'break' ? `${timeMinutes}m` : `${questions} Qs${timeMinutes > 0 ? ` \u2022 ${timeMinutes}m` : ''}`}
      </div>
    </div>
  );
}
