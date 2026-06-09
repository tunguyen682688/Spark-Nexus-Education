import type { FC } from 'react';
import { Video, Globe, Laptop } from 'lucide-react';

interface MediaBlockEditorProps {
  url: string;
  provider?: 'youtube' | 'local';
  onChange: (fields: { url?: string; provider?: 'youtube' | 'local' }) => void;
}

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
          <input
            type="text"
            value={url}
            onChange={(e) => onChange({ url: e.target.value })}
            className="w-full bg-[#0c1020]/45 border border-slate-850 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-slate-200 outline-none focus:border-blue-500/70 focus:bg-[#0c1020]/75 transition-all placeholder-slate-650 shadow-inner"
            placeholder="Dán liên kết video bài giảng (ví dụ: https://www.youtube.com/watch?v=...)"
          />
          <Video className="h-4 w-4 text-slate-400 absolute left-3.5 top-4" />
        </div>

        {/* Provider dropdown selector */}
        <div className="relative inline-block w-full sm:w-auto">
          <select
            value={provider}
            onChange={(e) => onChange({ provider: e.target.value as 'youtube' | 'local' })}
            className="appearance-none w-full sm:w-auto bg-[#0c1020]/45 border border-slate-850 rounded-2xl pl-10 pr-8 py-3.5 text-sm font-bold text-slate-200 outline-none cursor-pointer focus:border-blue-500/70 focus:bg-[#0c1020]/75 transition-all"
          >
            <option value="youtube">YouTube Video</option>
            <option value="local">Local Video</option>
          </select>
          {provider === 'youtube' ? (
            <Globe className="h-3.5 w-3.5 text-slate-500 absolute left-3.5 top-4" />
          ) : (
            <Laptop className="h-3.5 w-3.5 text-slate-500 absolute left-3.5 top-4" />
          )}
        </div>
      </div>

      {/* Inline Video Preview Box */}
      {url ? (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-900 bg-slate-950 shadow-inner flex items-center justify-center max-w-[480px] mx-auto mt-2">
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
        <div className="aspect-video w-full rounded-2xl border border-dashed border-slate-850 bg-[#0c1020]/20 flex flex-col items-center justify-center gap-1.5 text-slate-400 max-w-[480px] mx-auto mt-2">
          <Video className="h-6 w-6 text-slate-350" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Inline Preview Area
          </span>
          <p className="text-[10px] text-slate-400 italic">
            Dán link ở trên để phát video xem thử.
          </p>
        </div>
      )}
    </div>
  );
};
export default MediaBlockEditor;
