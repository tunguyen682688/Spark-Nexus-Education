import { FC, useState } from 'react';
import { Play, Video } from 'lucide-react';
import { GRAMMAR_UI_TEXT } from '../constants';

interface MediaBlockProps {
  url: string;
  provider?: 'youtube' | 'local';
  isEditable?: boolean;
  onChangeUrl?: (url: string) => void;
}

const T = GRAMMAR_UI_TEXT.lessonComponents.mediaBlock;

export const MediaBlock: FC<MediaBlockProps> = ({
  url = '',
  provider = 'youtube',
  isEditable = false,
  onChangeUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Helper để trích xuất YouTube ID hoặc lấy URL nhúng chuẩn
  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl) return '';
    if (rawUrl.includes('youtube.com/embed/')) return rawUrl;

    // Trích xuất ID từ watch?v= hoặc share link
    let videoId = '';
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\\&v=)([^#\\&\\?]*).*/;
    const match = rawUrl.match(regExp);

    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      // Fallback
      return rawUrl;
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  const embedUrl = getEmbedUrl(url);

  if (isEditable) {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
          <Video className="h-4 w-4 text-primary" />
          {T.editorTitle}
        </div>

        <input
          type="text"
          value={url}
          onChange={(e) => onChangeUrl && onChangeUrl(e.target.value)}
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
          placeholder={T.placeholderUrl}
        />

        {url ? (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border bg-muted flex items-center justify-center">
            <iframe
              src={embedUrl.replace('?autoplay=1', '')}
              title="Video Preview"
              className="w-full h-full border-none"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video w-full rounded-2xl border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Video className="h-8 w-8 text-muted-foreground/60" />
            <p className="text-xs">
              {T.emptyText}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-border bg-muted shadow-2xl group">
      {!isPlaying ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
          {/* Lớp phủ màn hình chờ phát */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

          {/* Nút Play trung tâm premium */}
          <button
            onClick={() => setIsPlaying(true)}
            className="relative h-20 w-20 flex items-center justify-center rounded-full bg-primary/95 text-white shadow-xl shadow-primary/25 hover:bg-primary hover:scale-110 active:scale-95 transition-all duration-300 z-20"
          >
            <Play className="h-9 w-9 text-white fill-white ml-1" />

            {/* Hiệu ứng sóng lan tỏa */}
            <span className="absolute -inset-2 rounded-full bg-primary/20 animate-ping opacity-75" />
          </button>
        </div>
      ) : null}

      {isPlaying && embedUrl ? (
        <iframe
          src={embedUrl}
          title="Lesson Video Player"
          className="w-full h-full border-none z-0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      ) : (
        // Ảnh nền của video chờ phát
        <div className="w-full h-full bg-card flex flex-col items-center justify-center gap-3">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border">
            <Video className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {T.readyBadge}
          </span>
        </div>
      )}
    </div>
  );
};
export default MediaBlock;
