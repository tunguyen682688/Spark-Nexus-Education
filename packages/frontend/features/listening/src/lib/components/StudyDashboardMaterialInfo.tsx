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
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 flex flex-col sm:flex-row gap-6 shadow-2xl">
        {/* Thumbnail Container */}
        <div className="w-full sm:w-48 aspect-video sm:aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shrink-0">
          {material.thumbnailUrl ? (
            <img
              src={material.thumbnailUrl}
              alt={material.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-955 to-purple-950/20">
              <Clock className="w-12 h-12 text-purple-500/30" />
            </div>
          )}
        </div>

        {/* Title & Stats */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-extrabold uppercase text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
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
                <span className="text-[9px] font-bold tracking-wider uppercase bg-violet-600 text-white px-2 py-0.5 rounded shadow-sm shadow-violet-650/20">
                  {LISTENING_DASHBOARD_TEXT.COMMUNITY_CONTRIBUTED}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 leading-snug">
              {material.title}
            </h1>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400 font-semibold border-t border-slate-800/60 pt-4">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" />
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
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 backdrop-blur-md">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300">
          {LISTENING_DASHBOARD_TEXT.DESCRIPTION_TITLE}
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          {material.description || LISTENING_DASHBOARD_TEXT.DEFAULT_DESCRIPTION}
        </p>

        {/* Tags */}
        {material.tags && material.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800/40">
            {material.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-[10px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-lg"
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
              ? 'bg-purple-600 border-purple-500 text-white'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-205'
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
          className="flex items-center gap-2 text-xs font-bold bg-slate-900/60 border border-slate-850 hover:bg-slate-800/60 text-slate-400 hover:text-slate-205 px-4 py-2.5 rounded-xl transition-all"
        >
          <ThumbsUp className="w-4 h-4 text-emerald-400" />
          {LISTENING_DASHBOARD_TEXT.FAVORITE_BUTTON} ({material.upvotes})
        </Button>
      </div>
    </div>
  );
};
