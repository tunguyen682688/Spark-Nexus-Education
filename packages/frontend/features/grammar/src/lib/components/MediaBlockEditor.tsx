import type { FC } from 'react';
import { Video, Globe, Laptop } from 'lucide-react';
import { Input } from '@spark-nest-ed/frontend-shared-components';
import { GRAMMAR_UI_TEXT } from '../constants';

interface MediaBlockEditorProps {
  url: string;
  provider?: 'youtube' | 'local';
  onChange: (fields: { url?: string; provider?: 'youtube' | 'local' }) => void;
}

const T = GRAMMAR_UI_TEXT.lessonComponents.mediaBlockEditor;

export const MediaBlockEditor: FC<MediaBlockEditorProps> = ({
  url = '',
  provider = 'youtube',
  onChange,
}) => {
  // Helper trích xuất ID YouTube hoặc lấy URL chuẩn để nhúng xem trước
  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl) return '';
    if (rawUrl.includes('youtube.com/embed/')) return rawUrl;

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\\&v=)([^#&\\?]*).*/;
    const match = rawUrl.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return rawUrl;
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* URL Input */}
        <div className="relative flex-1 w-full">
          <Input
            type="text"
            value={url}
            onChange={(e) => onChange({ url: e.target.value })}
            className="w-full bg-background border border-border rounded-2xl pl-10 pr-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/70 focus:bg-muted/30 transition-all placeholder:text-muted-foreground/50 shadow-inner"
            placeholder={T.placeholderUrl}
          />
          <Video className="h-4 w-4 text-muted-foreground absolute left-3.5 top-4" />
        </div>

        {/* Provider dropdown selector */}
        <div className="relative inline-block w-full sm:w-auto">
          <select
            value={provider}
            onChange={(e) => onChange({ provider: e.target.value as 'youtube' | 'local' })}
            className="appearance-none w-full sm:w-auto bg-background border border-border rounded-2xl pl-10 pr-8 py-3.5 text-sm font-bold text-foreground outline-none cursor-pointer focus:border-primary/70 focus:bg-muted/30 transition-all"
          >
            <option value="youtube">{T.optionYoutube}</option>
            <option value="local">{T.optionLocal}</option>
          </select>
          {provider === 'youtube' ? (
            <Globe className="h-3.5 w-3.5 text-muted-foreground absolute left-3.5 top-4" />
          ) : (
            <Laptop className="h-3.5 w-3.5 text-muted-foreground absolute left-3.5 top-4" />
          )}
        </div>
      </div>

      {/* Inline Video Preview Box */}
      {url ? (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border bg-muted shadow-inner flex items-center justify-center max-w-[480px] mx-auto mt-2">
          {provider === 'youtube' && embedUrl ? (
            <iframe
              src={embedUrl}
              title="Inline Video Preview"
              className="w-full h-full border-none"
              allowFullScreen
            />
          ) : (
            <video
              src={url}
              controls
              className="w-full h-full object-contain"
            />
          )}
        </div>
      ) : (
        <div className="aspect-video w-full rounded-2xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-1.5 text-muted-foreground max-w-[480px] mx-auto mt-2">
          <Video className="h-6 w-6 text-muted-foreground/60" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {T.previewArea}
          </span>
          <p className="text-[10px] text-muted-foreground italic">
            {T.previewInstruction}
          </p>
        </div>
      )}
    </div>
  );
};
export default MediaBlockEditor;
