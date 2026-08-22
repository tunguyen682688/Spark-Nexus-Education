import { useState, useRef, useCallback } from 'react';
import { Upload, Image, Music, Link, Trash2 } from 'lucide-react';

interface MediaUploadProps {
  type: 'image' | 'audio';
  value?: string;
  onChange: (url: string | undefined) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MediaUpload({
  type,
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  className = '',
}: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [inputMode, setInputMode] = useState<'drop' | 'url'>(value ? 'drop' : 'drop');
  const [urlInput, setUrlInput] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const Icon = type === 'image' ? Image : Music;
  const accept = type === 'image' ? 'image/jpeg,image/png,image/gif,image/webp' : 'audio/mpeg,audio/wav,audio/ogg,audio/mp4';
  const hint = type === 'image' ? 'JPG, PNG, GIF, WebP' : 'MP3, WAV, OGG, M4A';

  const handleFile = useCallback((file: File) => {
    if (disabled) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
      setPreviewError(false);
    };
    reader.readAsDataURL(file);
  }, [disabled, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith(type === 'image' ? 'image/' : 'audio/')) {
      handleFile(file);
    }
  }, [type, handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setPreviewError(false);
    }
  }, [urlInput, onChange]);

  const handleClear = useCallback(() => {
    onChange(undefined);
    setUrlInput('');
    setPreviewError(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [onChange]);

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground uppercase tracking-wide">
        <Icon className="w-3.5 h-3.5 text-indigo-500" />
        {label || (type === 'image' ? 'Hình ảnh' : 'Âm thanh')}
        {required && <span className="text-rose-500">*</span>}
      </label>

      {/* Preview area */}
      {value && !previewError && (
        <div className="relative group rounded-xl border border-border overflow-hidden bg-muted/30">
          {type === 'image' ? (
            <img
              src={value}
              alt="Preview"
              className="w-full h-40 object-contain"
              onError={() => setPreviewError(true)}
            />
          ) : (
            <div className="p-4">
              <audio
                src={value}
                controls
                className="w-full h-10"
                onError={() => setPreviewError(true)}
              />
            </div>
          )}
          {!disabled && (
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Drop zone / URL input */}
      {!value && (
        <div className="space-y-2">
          {/* Toggle buttons */}
          <div className="flex gap-1">
            <button
              onClick={() => setInputMode('drop')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                inputMode === 'drop'
                  ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600'
                  : 'border-border text-muted-foreground hover:bg-muted/60'
              }`}
            >
              <Upload className="w-3 h-3" />
              Tải file
            </button>
            <button
              onClick={() => setInputMode('url')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                inputMode === 'url'
                  ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600'
                  : 'border-border text-muted-foreground hover:bg-muted/60'
              }`}
            >
              <Link className="w-3 h-3" />
              Dán URL
            </button>
          </div>

          {inputMode === 'drop' ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !disabled && fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                disabled
                  ? 'border-border bg-muted/20 opacity-50 cursor-not-allowed'
                  : isDragging
                    ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                    : 'border-border hover:border-indigo-300 hover:bg-muted/30'
              }`}
            >
              <div className={`p-2 rounded-lg ${isDragging ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-muted/50'}`}>
                <Icon className={`w-5 h-5 ${isDragging ? 'text-indigo-500' : 'text-muted-foreground'}`} />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-semibold text-foreground">
                  {isDragging ? 'Thả file vào đây' : 'Kéo thả hoặc nhấn để chọn'}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Hỗ trợ: {hint}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                placeholder={type === 'image' ? 'https://example.com/image.jpg' : 'https://example.com/audio.mp3'}
                disabled={disabled}
                className="flex-1 text-[13px] text-foreground bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all disabled:opacity-50"
              />
              <button
                onClick={handleUrlSubmit}
                disabled={disabled || !urlInput.trim()}
                className="px-3 py-2 text-[11px] font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
