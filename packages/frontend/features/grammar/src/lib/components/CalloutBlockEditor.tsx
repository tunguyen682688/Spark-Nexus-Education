import type { FC } from 'react';
import { AlertCircle } from 'lucide-react';
import { Input, Textarea } from '@spark-nest-ed/frontend-shared-components';
import { GRAMMAR_UI_TEXT } from '../constants';

interface CalloutBlockEditorProps {
  title: string;
  content: string;
  onChange: (fields: { title?: string; content?: string }) => void;
}

const T = GRAMMAR_UI_TEXT.lessonComponents.calloutEditor;

export const CalloutBlockEditor: FC<CalloutBlockEditorProps> = ({
  title = '',
  content = '',
  onChange,
}) => {
  return (
    <div className="space-y-4 bg-muted/20 border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs font-extrabold text-primary uppercase tracking-wider">
        <AlertCircle className="h-4 w-4 text-primary" />
        {T.title}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {T.labelTitle}
        </label>
        <Input
          type="text"
          value={title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/70 focus:bg-muted/30 transition-all placeholder:text-muted-foreground/50 shadow-inner font-bold"
          placeholder={T.placeholderTitle}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {T.labelContent}
        </label>
        <Textarea
          value={content}
          onChange={(e) => onChange({ content: e.target.value })}
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground outline-none focus:border-primary/70 focus:bg-muted/30 transition-all placeholder:text-muted-foreground/50 shadow-inner resize-none leading-relaxed"
          rows={4}
          placeholder={T.placeholderContent}
        />
      </div>
    </div>
  );
};

export default CalloutBlockEditor;
