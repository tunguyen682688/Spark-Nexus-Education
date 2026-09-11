import { useState, useRef, useCallback } from 'react';
import { Upload, Image, Music, Link, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFileUpload } from '@spark-nest-ed/frontend-shared-hooks';

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
  const [inputMode, setInputMode] = useState<'drop' | 'url'>('drop');
  const [urlInput, setUrlInput] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { upload, status, progress, error, reset } = useFileUpload({
    visibility: 'public',
    onSuccess: (file) => {
      onChange(file.id);
      setPreviewError(false);
    },
    onError: () => {},
  });

  const Icon = type === 'image' ? Image : Music;
  const accept = type === 'image' ? 'image/jpeg,image/png,image/gif,image/webp' : 'audio/mpeg,audio/wav,audio/ogg,audio/mp4';
  const hint = type === 'image' ? 'JPG, PNG, GIF, WebP' : 'MP3, WAV, OGG, M4A';

  const handleFile = useCallback((file: File) => {
    if (disabled) return;
    upload(file);
  }, [disabled, upload]);

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
    reset();
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [onChange, reset]);

  const isUploading = status === 'requesting' || status === 'uploading' || status === 'confirming';
  const uploadSuccess = status === 'done';
  const uploadError = status === 'error';

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground uppercase tracking-wide">
        <Icon className="w-3.5 h-3.5 text-indigo-500" />
        {label || (type === 'image' ? 'Hinh anh' : 'Am thanh')}
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

      {/* Upload progress */}
      {isUploading && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
            <span className="text-[11px] font-semibold text-indigo-600">
              {status === 'requesting' && 'Dang tao lien ket...'}
              {status === 'uploading' && `Dang tai len... ${progress}%`}
              {status === 'confirming' && 'Dang xac nhan...'}
            </span>
          </div>
          <div className="w-full bg-indigo-100 dark:bg-indigo-900/30 rounded-full h-1.5">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload success */}
      {uploadSuccess && !value && (
        <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Tai len thanh cong
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className="flex items-center gap-2 text-[11px] text-rose-600 font-semibold">
          <AlertCircle className="w-3.5 h-3.5" />
          {error?.message || 'Tai len that bai'}
        </div>
      )}

      {/* Drop zone / URL input */}
      {!value && !isUploading && (
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
              Tai file
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
              Dan URL
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
                  {isDragging ? 'Tha file vao day' : 'Keo hoac nhan de chon'}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Ho tro: {hint}
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
                Ap dung
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
