import React from 'react';
import { Play, Headset, Video, Award } from 'lucide-react';

/**
 * Shared utility for level color coding mapping
 */
export const getDifficultyColor = (level: string): string => {
  switch (level) {
    case 'A1':
    case 'A2':
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'B1':
    case 'B2':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'C1':
    case 'C2':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

/**
 * Shared utility for formatting duration from seconds to MM:SS
 */
export const formatDuration = (secs: number): string => {
  const mins = Math.floor(secs / 60);
  const remainingSecs = secs % 60;
  return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
};

/**
 * Shared utility for mapping category type to Lucide icons
 */
export const getCategoryIcon = (category: string): React.ReactNode => {
  switch (category) {
    case 'podcast':
      return <Headset className="w-4 h-4 text-primary" />;
    case 'video':
      return <Video className="w-4 h-4 text-red-400" />;
    case 'exam':
      return <Award className="w-4 h-4 text-emerald-400" />;
    default:
      return <Play className="w-4 h-4 text-blue-400" />;
  }
};
