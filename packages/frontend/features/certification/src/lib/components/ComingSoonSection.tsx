import { Lock } from 'lucide-react';

interface ComingSoonSectionProps {
  title: string;
  description: string;
}

export const ComingSoonSection = ({
  title,
  description,
}: ComingSoonSectionProps) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3 border border-dashed border-border rounded-2xl bg-muted/20">
    <div className="w-10 h-10 rounded-full bg-accent/40 flex items-center justify-center">
      <Lock className="w-5 h-5 text-muted-foreground" />
    </div>
    <div className="space-y-1">
      <p className="text-sm font-bold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);
