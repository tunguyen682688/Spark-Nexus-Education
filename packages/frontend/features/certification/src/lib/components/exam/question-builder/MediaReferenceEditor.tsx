import { Headphones, ImageIcon, BookOpen, ExternalLink } from 'lucide-react';

interface MediaReferenceEditorProps {
  audioUrl?: string;
  imageUrl?: string;
  passageId?: string;
  supportsAudio?: boolean;
  supportsImage?: boolean;
  supportsPassage?: boolean;
  referenceType: 'Passage' | 'Image' | 'External Link';
  passageSource: string;
  highlight: string;
  onAudioUrlChange?: (value: string) => void;
  onImageUrlChange?: (value: string) => void;
  onPassageIdChange?: (value: string) => void;
  onReferenceTypeChange: (value: 'Passage' | 'Image' | 'External Link') => void;
  onPassageSourceChange: (value: string) => void;
  onHighlightChange: (value: string) => void;
}

export function MediaReferenceEditor({
  audioUrl = '',
  imageUrl = '',
  passageId = '',
  supportsAudio = false,
  supportsImage = false,
  supportsPassage = false,
  referenceType,
  passageSource,
  highlight,
  onAudioUrlChange,
  onImageUrlChange,
  onPassageIdChange,
  onReferenceTypeChange,
  onPassageSourceChange,
  onHighlightChange,
}: MediaReferenceEditorProps) {
  return (
    <div className="space-y-4">
      {/* Audio URL */}
      {supportsAudio && onAudioUrlChange && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Headphones className="w-4 h-4 text-indigo-600" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
              Audio
            </h3>
          </div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase block">
            Audio URL
          </label>
          <input
            value={audioUrl}
            onChange={(e) => onAudioUrlChange(e.target.value)}
            placeholder="https://...mp3"
            className="w-full text-xs font-semibold text-foreground bg-background border border-border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Image URL */}
      {supportsImage && onImageUrlChange && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
              Image
            </h3>
          </div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase block">
            Image URL
          </label>
          <input
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder="https://...jpg"
            className="w-full text-xs font-semibold text-foreground bg-background border border-border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Passage Selector */}
      {supportsPassage && onPassageIdChange && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
              Passage
            </h3>
          </div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase block">
            Passage / Source
          </label>
          <select
            value={passageId}
            onChange={(e) => onPassageIdChange(e.target.value)}
            className="w-full bg-background border border-border text-xs font-bold text-foreground py-1.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">Select passage...</option>
            <option value="passage-1">Passage 1</option>
            <option value="passage-2">Passage 2</option>
            <option value="passage-3">Passage 3</option>
          </select>
        </div>
      )}

      {/* Generic Reference Section */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <ExternalLink className="w-4 h-4 text-indigo-600" />
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
            Reference (Optional)
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          {(['Passage', 'Image', 'External Link'] as const).map((type) => (
            <label key={type} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="refType"
                value={type}
                checked={referenceType === type}
                onChange={() => onReferenceTypeChange(type)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>

        <div className="space-y-2 pt-1 text-xs">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase block">
              Passage / Source
            </label>
            <select
              value={passageSource}
              onChange={(e) => onPassageSourceChange(e.target.value)}
              className="w-full bg-background border border-border text-xs font-bold text-foreground py-1.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Passage 2">Passage 2</option>
              <option value="Passage 1">Passage 1</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase block">
              Highlight (optional)
            </label>
            <input
              value={highlight}
              onChange={(e) => onHighlightChange(e.target.value)}
              className="w-full text-xs bg-background border border-border rounded-xl p-1.5 h-8"
            />
            <span className="text-[10px] text-muted-foreground font-medium block">
              Helps learners locate the answer in the passage.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
