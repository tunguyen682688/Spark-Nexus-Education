import { FC, useState } from 'react';
import { Play, Video } from 'lucide-react';

interface MediaBlockProps {
  url: string;
  provider?: 'youtube' | 'local';
  isEditable?: boolean;
  onChangeUrl?: (url: string) => void;
}

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
      <div className="bg-[#070a14] border border-slate-900 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          <Video className="h-4 w-4 text-blue-500" />
          Video Bài Giảng (Media Link)
        </div>

        <input
          type="text"
          value={url}
          onChange={(e) => onChangeUrl && onChangeUrl(e.target.value)}
          className="w-full bg-[#0c1020] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
          placeholder="Dán link video bài giảng (Youtube hoặc mp4)..."
        />

        {url ? (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-900 bg-slate-950 flex items-center justify-center">
            <iframe
              src={embedUrl.replace('?autoplay=1', '')}
              title="Video Preview"
              className="w-full h-full border-none"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video w-full rounded-2xl border border-dashed border-slate-800 bg-[#0c1020]/30 flex flex-col items-center justify-center gap-2 text-slate-500">
            <Video className="h-8 w-8 text-slate-650" />
            <p className="text-xs">
              Chưa có video được thiết lập. Hãy dán liên kết ở trên.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-slate-900 bg-slate-950 shadow-2xl group">
      {!isPlaying ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/40 backdrop-blur-[1px]">
          {/* Lớp phủ màn hình chờ phát */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

          {/* Nút Play trung tâm premium */}
          <button
            onClick={() => setIsPlaying(true)}
            className="relative h-20 w-20 flex items-center justify-center rounded-full bg-blue-600/90 text-white shadow-xl shadow-blue-500/25 hover:bg-blue-500 hover:scale-110 active:scale-95 transition-all duration-300 z-20 group-hover:bg-blue-500"
          >
            <Play className="h-9 w-9 text-white fill-white ml-1" />

            {/* Hiệu ứng sóng lan tỏa */}
            <span className="absolute -inset-2 rounded-full bg-blue-500/20 animate-ping opacity-75" />
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
        <div className="w-full h-full bg-[#070a14] flex flex-col items-center justify-center gap-3">
          <div className="h-14 w-14 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 border border-slate-800">
            <Video className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            VIDEO LECTURE READY
          </span>
        </div>
      )}
    </div>
  );
};
export default MediaBlock;
