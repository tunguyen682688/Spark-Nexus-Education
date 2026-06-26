import { ListeningMaterial } from '../types';
import { Play, Eye, ThumbsUp, Keyboard } from 'lucide-react';
import { getDifficultyColor, formatDuration, getCategoryIcon } from '../utils/listening-helpers';
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

  return (
    <div
      onClick={() => onClick(material.id)}
      className="group relative flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
    >
      {/* Thumbnail or Category Placeholder */}
      <div className="relative aspect-video w-full bg-muted overflow-hidden">
        {material.thumbnailUrl ? (
          <img
            src={material.thumbnailUrl}
            alt={material.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/60">
            {getCategoryIcon(material.category)}
          </div>
        )}

        {/* Hover overlay with Play button */}
        <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
          <div className="p-4 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 fill-current" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getDifficultyColor(material.difficulty)}`}>
            {material.difficulty}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold bg-background/80 backdrop-blur-md text-foreground rounded-full border border-border">
            {getCategoryIcon(material.category)}
            <span className="capitalize">{material.category}</span>
          </Badge>
        </div>

        {/* Duration badge */}
        <span className="absolute bottom-3 right-3 px-2 py-0.5 text-xs font-medium bg-background/80 backdrop-blur-md text-foreground rounded-md border border-border/60">
          {formatDuration(material.duration)}
        </span>

        {/* Community contribution label */}
        {material.isCommunity && (
          <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-primary text-primary-foreground rounded shadow-sm shadow-primary/20">
            {LISTENING_CARD_TEXT.COMMUNITY_LABEL}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-5">
        <span className="text-xs font-medium text-muted-foreground mb-2 truncate">
          {material.author || LISTENING_CARD_TEXT.DEFAULT_AUTHOR}
        </span>
        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3">
          {material.title}
        </h3>

        {/* Description fallback */}
        {material.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {material.description}
          </p>
        )}

        <div className="flex-1 flex items-end">
          <div className="w-full flex items-center justify-between pt-3 border-t border-border/80">
            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {material.viewCount}
              </span>
              {(material.upvotes > 0 || material.downvotes > 0) && (
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {material.upvotes}
                </span>
              )}
            </div>

            {/* Questions Indicator & Dictation CTA */}
            <div className="flex items-center gap-2 shrink-0">
              {material.questions && material.questions.length > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
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
}
