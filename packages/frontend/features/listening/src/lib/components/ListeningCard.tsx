import { ListeningMaterial } from '../types';
import { Play, Headset, Video, Award, Eye, ThumbsUp, HelpCircle } from 'lucide-react';

interface ListeningCardProps {
  material: ListeningMaterial;
  onClick: (id: string) => void;
}

export default function ListeningCard({ material, onClick }: ListeningCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'podcast':
        return <Headset className="w-4 h-4 text-purple-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-red-400" />;
      case 'exam':
        return <Award className="w-4 h-4 text-emerald-400" />;
      default:
        return <Play className="w-4 h-4 text-blue-400" />;
    }
  };

  const getDifficultyColor = (level: string) => {
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
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  // Safe division for duration formatting
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const hasProgress = material.userProgress && material.userProgress.progress > 0;
  const progressPercent = material.userProgress?.progress || 0;

  return (
    <div
      onClick={() => onClick(material.id)}
      className="group relative flex flex-col bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-300 cursor-pointer"
    >
      {/* Thumbnail or Category Placeholder */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
        {material.thumbnailUrl ? (
          <img
            src={material.thumbnailUrl}
            alt={material.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
            {material.category === 'podcast' && <Headset className="w-12 h-12 text-purple-500/40" />}
            {material.category === 'video' && <Video className="w-12 h-12 text-red-500/40" />}
            {material.category === 'exam' && <Award className="w-12 h-12 text-emerald-500/40" />}
            {material.category !== 'podcast' && material.category !== 'video' && material.category !== 'exam' && (
              <Play className="w-12 h-12 text-blue-500/40" />
            )}
          </div>
        )}

        {/* Hover overlay with Play button */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
          <div className="p-4 bg-purple-600 text-white rounded-full shadow-lg shadow-purple-600/30 transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 fill-current" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getDifficultyColor(material.difficulty)}`}>
            {material.difficulty}
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold bg-slate-950/80 backdrop-blur-md text-slate-300 rounded-full border border-slate-800">
            {getCategoryIcon(material.category)}
            <span className="capitalize">{material.category}</span>
          </span>
        </div>

        {/* Duration badge */}
        <span className="absolute bottom-3 right-3 px-2 py-0.5 text-xs font-medium bg-slate-950/80 backdrop-blur-md text-slate-300 rounded-md border border-slate-800/60">
          {formatDuration(material.duration)}
        </span>

        {/* Community contribution label */}
        {material.isCommunity && (
          <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-violet-600 text-white rounded shadow-sm shadow-violet-600/20">
            Cộng đồng
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-5">
        <span className="text-xs font-medium text-slate-500 mb-2 truncate">
          {material.author || 'Danh mục Luyện nghe'}
        </span>
        <h3 className="text-base font-bold text-slate-200 group-hover:text-purple-400 transition-colors line-clamp-2 mb-3">
          {material.title}
        </h3>

        {/* Description fallback */}
        {material.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {material.description}
          </p>
        )}

        <div className="flex-1 flex items-end">
          <div className="w-full flex items-center justify-between pt-3 border-t border-slate-800/80">
            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {material.viewCount}
              </span>
              {(material.upvotes > 0 || material.downvotes > 0) && (
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                  {material.upvotes}
                </span>
              )}
            </div>

            {/* Questions Indicator */}
            {material.questions && material.questions.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                <HelpCircle className="w-3 h-3" />
                {material.questions.length} CH
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar overlay */}
      {hasProgress && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-950">
          <div
            className={`h-full transition-all duration-300 ${
              progressPercent >= 100 ? 'bg-emerald-500' : 'bg-purple-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}
