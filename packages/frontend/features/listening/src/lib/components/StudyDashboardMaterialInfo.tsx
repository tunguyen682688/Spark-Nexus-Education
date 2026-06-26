import React from 'react';
import {
  Clock,
  User,
  Eye,
  Bookmark,
  ThumbsUp,
} from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { LISTENING_DASHBOARD_TEXT } from '../constants/listening-constants';

export interface StudyDashboardMaterialInfoProps {
  material: any;
  isBookmarked: boolean;
  handleToggleBookmark: () => void;
  handleVote: (vote: number) => void;
  getCategoryLabel: (category: string) => string;
  getDifficultyColor: (difficulty: string) => string;
  formatDuration: (duration: number) => string;
}

export const StudyDashboardMaterialInfo: React.FC<StudyDashboardMaterialInfoProps> = ({
  material,
  isBookmarked,
  handleToggleBookmark,
  handleVote,
  getCategoryLabel,
  getDifficultyColor,
  formatDuration,
}) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Main Info Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card backdrop-blur-md p-6 sm:p-8 flex flex-col sm:flex-row gap-6 shadow-2xl">
        {/* Thumbnail Container */}
        <div className="w-full sm:w-48 aspect-video sm:aspect-square bg-muted rounded-2xl overflow-hidden border border-border shrink-0">
          {material.thumbnailUrl ? (
            <img
              src={material.thumbnailUrl}
              alt={material.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-muted">
              <Clock className="w-12 h-12 text-primary/30" />
            </div>
          )}
        </div>

        {/* Title & Stats */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-extrabold uppercase text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                {getCategoryLabel(material.category)}
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getDifficultyColor(
                  material.difficulty
                )}`}
              >
                {LISTENING_DASHBOARD_TEXT.LEVEL_LABEL}: {material.difficulty}
              </span>
              {material.isCommunity && (
                <span className="text-[9px] font-bold tracking-wider uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded shadow-sm shadow-primary/25">
                  {LISTENING_DASHBOARD_TEXT.COMMUNITY_CONTRIBUTED}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground leading-snug">
              {material.title}
            </h1>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground font-semibold border-t border-border/60 pt-4">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              {material.author || 'Spark Nexus'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              {formatDuration(material.duration)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              {material.viewCount} {LISTENING_DASHBOARD_TEXT.VIEW_COUNT}
            </span>
          </div>
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4 backdrop-blur-md">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
          {LISTENING_DASHBOARD_TEXT.DESCRIPTION_TITLE}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {material.description || LISTENING_DASHBOARD_TEXT.DEFAULT_DESCRIPTION}
        </p>

        {/* Tags */}
        {material.tags && material.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border/40">
            {material.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-[10px] font-bold text-muted-foreground bg-background border border-border px-2.5 py-1 rounded-lg"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Section: Bookmark / Vote */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleToggleBookmark}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition-all ${
            isBookmarked
              ? 'bg-primary border-primary text-primary-foreground'
              : 'bg-card border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bookmark
            className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`}
          />
          {isBookmarked
            ? LISTENING_DASHBOARD_TEXT.BOOKMARK_SAVED
            : LISTENING_DASHBOARD_TEXT.BOOKMARK_SAVE}
        </Button>
        <Button
          onClick={() => handleVote(1)}
          className="flex items-center gap-2 text-xs font-bold bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-xl transition-all"
        >
          <ThumbsUp className="w-4 h-4 text-emerald-400" />
          {LISTENING_DASHBOARD_TEXT.FAVORITE_BUTTON} ({material.upvotes})
        </Button>
      </div>
    </div>
  );
};
