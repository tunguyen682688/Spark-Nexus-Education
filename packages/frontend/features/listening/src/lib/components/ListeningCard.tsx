import { ListeningMaterial } from '../types';
import { Play, Eye, ThumbsUp, Keyboard, Headset, Video, BookOpen, Award, FileText, Clock } from 'lucide-react';
import { getDifficultyColor, formatDuration } from '../utils/listening-helpers';
import { LISTENING_CARD_TEXT } from '../constants';
import { Badge, Button } from '@spark-nest-ed/frontend-shared-components';

interface ListeningCardProps {
  material: ListeningMaterial;
  onClick: (id: string) => void;
  onDictationClick?: (id: string) => void;
}

export default function ListeningCard({ material, onClick, onDictationClick }: ListeningCardProps) {
  const hasProgress = material.userProgress && material.userProgress.progress > 0;
  const progressPercent = material.userProgress?.progress || 0;

  // --- PODCAST LAYOUT ---
  const renderPodcastLayout = () => {
    return (
      <div
        onClick={() => onClick(material.id)}
        className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card border border-border/80 hover:border-primary/30 p-4 rounded-2xl hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer w-full"
      >
        {/* Cover Artwork */}
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden shrink-0 bg-muted shadow-md border border-border/60">
          {material.thumbnailUrl ? (
            <img
              src={material.thumbnailUrl}
              alt={material.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
              <Headset className="w-8 h-8" />
            </div>
          )}
          
          {/* Hover Play Button Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
            <Play className="w-6 h-6 text-white fill-current" />
          </div>
        </div>

        {/* Info & Audio Wave */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getDifficultyColor(material.difficulty)}`}>
              {material.difficulty}
            </Badge>
            <span className="text-[10px] font-bold text-primary tracking-wide uppercase">Podcast</span>
            {material.isCommunity && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-primary/10 text-primary rounded">
                {LISTENING_CARD_TEXT.COMMUNITY_LABEL}
              </span>
            )}
          </div>
          
          <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors truncate pr-4">
            {material.title}
          </h3>
          
          <p className="text-xs text-muted-foreground font-medium truncate">
            {material.author || LISTENING_CARD_TEXT.DEFAULT_AUTHOR}
          </p>

          {/* Sound Waves & Duration */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-end gap-0.5 h-3.5 w-6 shrink-0">
              <span className="w-0.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '0.8s' }} />
              <span className="w-0.5 h-3.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '0.6s' }} />
              <span className="w-0.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '0.9s' }} />
              <span className="w-0.5 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '0.7s' }} />
            </div>
            <span className="text-xs font-semibold text-muted-foreground/80">
              {formatDuration(material.duration)}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs font-semibold text-muted-foreground/80 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {material.viewCount}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/60">
          {material.questions && material.questions.length > 0 && (
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {material.questions.length} CH
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDictationClick?.(material.id);
            }}
            className="h-8 text-xs font-bold text-primary bg-primary/5 border border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary px-3 py-1 rounded-full transition-all duration-200"
          >
            <Keyboard className="w-3.5 h-3.5" />
            {LISTENING_CARD_TEXT.DICTATION_CTA}
          </Button>
        </div>

        {/* Progress Bar overlay */}
        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-border">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercent >= 100 ? 'bg-emerald-500' : 'bg-primary'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  // --- VIDEO LAYOUT ---
  const renderVideoLayout = () => {
    return (
      <div
        onClick={() => onClick(material.id)}
        className="group relative flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
      >
        {/* Video Thumbnail (16:9 Aspect Ratio) */}
        <div className="relative aspect-video w-full bg-black overflow-hidden">
          {material.thumbnailUrl ? (
            <img
              src={material.thumbnailUrl}
              alt={material.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-500/20 to-red-500/5 text-red-500">
              <Video className="w-10 h-10" />
            </div>
          )}

          {/* Glowing Play Icon Overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
            <div className="p-4 bg-red-600 text-white rounded-full shadow-lg shadow-red-600/30 transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-6 h-6 fill-current" />
            </div>
          </div>

          {/* Category Live Badge */}
          <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-red-600 text-white rounded-full flex items-center gap-1 shadow-md">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            Video
          </span>

          {/* Difficulty Badge */}
          <Badge className={`absolute top-3 right-3 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getDifficultyColor(material.difficulty)} shadow-md`}>
            {material.difficulty}
          </Badge>

          {/* Duration overlay */}
          <span className="absolute bottom-3 right-3 px-2 py-0.5 text-[11px] font-bold bg-black/85 text-white rounded border border-white/10">
            {formatDuration(material.duration)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-5 space-y-3">
          {/* Author/Channel Info */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-extrabold text-muted-foreground uppercase">
              {material.author ? material.author.substring(0, 2) : 'YT'}
            </div>
            <span className="text-xs font-semibold text-muted-foreground truncate">
              {material.author || LISTENING_CARD_TEXT.DEFAULT_AUTHOR}
            </span>
          </div>

          <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {material.title}
          </h3>

          {material.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {material.description}
            </p>
          )}

          {/* Footer stats and Actions */}
          <div className="flex-1 flex items-end">
            <div className="w-full flex items-center justify-between pt-3 border-t border-border/60">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold">
                  <Eye className="w-3.5 h-3.5" />
                  {material.viewCount}
                </span>
                {material.upvotes > 0 && (
                  <span className="flex items-center gap-1 font-semibold">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {material.upvotes}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {material.questions && material.questions.length > 0 && (
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {material.questions.length} CH
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDictationClick?.(material.id);
                  }}
                  className="h-7 text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary px-3 py-1 rounded-full transition-all duration-200"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  {LISTENING_CARD_TEXT.DICTATION_CTA}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar overlay */}
        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-border">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercent >= 100 ? 'bg-emerald-500' : 'bg-primary'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  // --- AUDIOBOOK LAYOUT (PORTRAIT) ---
  const renderAudiobookLayout = () => {
    return (
      <div
        onClick={() => onClick(material.id)}
        className="group relative flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer p-4"
      >
        {/* Book Cover Container (Taller portrait aspect-ratio) */}
        <div className="relative aspect-[2/3] w-32 sm:w-36 md:w-40 mx-auto bg-muted rounded-xl shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1.5 border border-border/60 shrink-0">
          {material.thumbnailUrl ? (
            <img
              src={material.thumbnailUrl}
              alt={material.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-500/20 to-blue-500/5 text-blue-500">
              <BookOpen className="w-12 h-12" />
            </div>
          )}

          {/* Book Spine Edge effect on the left */}
          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/20 backdrop-blur-[1px] border-r border-white/10" />

          {/* Book page deck stack overlay on the right */}
          <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-background/10 to-background/35 border-l border-white/20" />
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
            <div className="p-3 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30">
              <Play className="w-5 h-5 fill-current" />
            </div>
          </div>

          {/* Duration tag at bottom */}
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[9px] font-black bg-black/75 text-white rounded border border-white/10">
            {formatDuration(material.duration)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col pt-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <Badge className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getDifficultyColor(material.difficulty)}`}>
              {material.difficulty}
            </Badge>
            <span className="text-[10px] font-bold text-blue-500 tracking-wider uppercase">Sách Nói</span>
          </div>

          <h3 className="text-sm sm:text-base font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1 leading-snug">
            {material.title}
          </h3>

          <span className="text-xs font-semibold text-muted-foreground italic mb-3 block truncate">
            Tác giả: {material.author || LISTENING_CARD_TEXT.DEFAULT_AUTHOR}
          </span>

          {/* Bottom actions */}
          <div className="flex-1 flex items-end pt-3 border-t border-border/50">
            <div className="w-full flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {material.viewCount}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDictationClick?.(material.id);
                }}
                className="h-7 text-[10px] font-black text-primary bg-primary/5 border border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary px-2.5 py-0.5 rounded-full transition-all duration-200"
              >
                <Keyboard className="w-3 h-3" />
                {LISTENING_CARD_TEXT.DICTATION_CTA}
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Bar overlay */}
        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-border">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercent >= 100 ? 'bg-emerald-500' : 'bg-primary'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  // --- PRACTICE/EXAM LAYOUT ---
  const renderExamLayout = () => {
    return (
      <div
        onClick={() => onClick(material.id)}
        className="group relative flex flex-col bg-card border border-border/80 hover:border-emerald-500/30 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer"
      >
        {/* Certificate/Formal header banner */}
        <div className="h-20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/5 border-b border-border/60 flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-emerald-500 tracking-wider uppercase">Exam Board</span>
              <p className="text-[9px] text-muted-foreground font-bold leading-none mt-0.5">TOEIC / IELTS Prep</p>
            </div>
          </div>
          <Badge className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getDifficultyColor(material.difficulty)} shadow-sm`}>
            {material.difficulty}
          </Badge>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-5 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground group-hover:text-emerald-500 transition-colors line-clamp-2 leading-snug">
              {material.title}
            </h3>
            {material.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                {material.description}
              </p>
            )}
          </div>

          {/* Details list */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/50">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground/75" />
              <span>{formatDuration(material.duration)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground/75" />
              <span>{material.questions?.length || 0} Câu hỏi</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-1 flex items-end">
            <div className="w-full flex items-center justify-between pt-3 border-t border-border/60">
              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {material.viewCount} lượt thi
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDictationClick?.(material.id);
                  }}
                  className="h-8 text-xs font-bold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 px-3.5 py-1.5 rounded-full transition-all duration-200"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  {LISTENING_CARD_TEXT.DICTATION_CTA}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar overlay */}
        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-border">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercent >= 100 ? 'bg-emerald-500' : 'bg-emerald-500/80'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  // --- NEWS LAYOUT ---
  const renderNewsLayout = () => {
    return (
      <div
        onClick={() => onClick(material.id)}
        className="group relative flex flex-col bg-card border border-border/80 hover:border-amber-500/30 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer"
      >
        {/* News Editorial Top Bar */}
        <div className="relative h-14 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/5 border-b border-border/60 flex items-center justify-between px-5 shrink-0">
          <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase">
            📰 NEWS FEED
          </span>
          <Badge className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getDifficultyColor(material.difficulty)}`}>
            {material.difficulty}
          </Badge>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-5 space-y-3">
          {/* Masthead details */}
          <div className="flex items-center justify-between text-[10px] font-extrabold text-muted-foreground/80 tracking-wider">
            <span className="uppercase">{material.author || 'REUTERS FEED'}</span>
            <span>{formatDuration(material.duration)}</span>
          </div>

          <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight font-serif tracking-tight">
            {material.title}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
            {material.description || 'Bản tin ngắn cập nhật về các sự kiện quốc tế phục vụ luyện nghe tiếng Anh học thuật.'}
          </p>

          {/* Footer stats & Actions */}
          <div className="flex-1 flex items-end">
            <div className="w-full flex items-center justify-between pt-3 border-t border-border/60">
              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {material.viewCount}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                {material.questions && material.questions.length > 0 && (
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {material.questions.length} CH
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDictationClick?.(material.id);
                  }}
                  className="h-7 text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary px-3 py-1 rounded-full transition-all duration-200"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  {LISTENING_CARD_TEXT.DICTATION_CTA}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar overlay */}
        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-border">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercent >= 100 ? 'bg-emerald-500' : 'bg-primary'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  // Switch layout based on category type
  switch (material.category) {
    case 'podcast':
      return renderPodcastLayout();
    case 'video':
      return renderVideoLayout();
    case 'audio':
      return renderAudiobookLayout();
    case 'exam':
      return renderExamLayout();
    case 'news':
      return renderNewsLayout();
    default:
      return renderVideoLayout(); // Fallback layout
  }
}
