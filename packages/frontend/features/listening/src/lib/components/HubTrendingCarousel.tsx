import React from 'react';
import { Flame, ChevronLeft, ChevronRight, Headset, Sparkle } from 'lucide-react';
import { LISTENING_ROUTES, LISTENING_HUB_TEXT } from '../constants';

interface HubTrendingCarouselProps {
  trendingItems: any[];
  trendingScrollRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => void;
  navigate: (route: string) => void;
}

export const HubTrendingCarousel: React.FC<HubTrendingCarouselProps> = ({
  trendingItems,
  trendingScrollRef,
  handleScroll,
  navigate,
}) => {
  const text = LISTENING_HUB_TEXT.TRENDING;

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'A1':
      case 'A2':
        return 'border-green-500/35 text-green-400 bg-green-500/5';
      case 'B1':
      case 'B2':
        return 'border-blue-500/35 text-blue-450 bg-blue-500/5';
      case 'C1':
      case 'C2':
        return 'border-purple-500/35 text-purple-400 bg-purple-500/5';
      default:
        return 'border-slate-800 text-slate-400 bg-slate-900/35';
    }
  };

  if (trendingItems.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Flame className="w-5.5 h-5.5 text-orange-500 animate-pulse" />
            {text.TITLE}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">{text.SUBTITLE}</p>
        </div>
        
        {/* Nav Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll(trendingScrollRef, 'left')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll(trendingScrollRef, 'right')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 active:scale-95 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scroll Container */}
      <div
        ref={trendingScrollRef}
        className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
      >
        {trendingItems.map((material) => (
          <div
            key={material.id}
            onClick={() => navigate(LISTENING_ROUTES.STUDY(material.id))}
            className="min-w-[280px] sm:min-w-[340px] max-w-[340px] snap-start group relative flex flex-col bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-slate-850 hover:border-purple-500/40 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-300"
          >
            {/* Thumbnail */}
            <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
              {material.thumbnailUrl ? (
                <img
                  src={material.thumbnailUrl}
                  alt={material.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-955/30 to-slate-950">
                  <Headset className="w-12 h-12 text-purple-500/20" />
                </div>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${getDifficultyColor(material.difficulty)}`}>
                  {material.difficulty}
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-black/60 backdrop-blur-md rounded-full text-slate-355 capitalize border border-slate-850">
                  {material.category}
                </span>
              </div>
              
              <span className="absolute top-3 right-3 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-orange-600 text-white rounded shadow-sm">
                TRENDING
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-4 space-y-2 justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block truncate">
                  {material.author || text.DEFAULT_AUTHOR}
                </span>
                <h3 className="text-sm font-extrabold text-slate-200 group-hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
                  {material.title}
                </h3>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-3 mt-2">
                <span>{material.viewCount} {text.VIEWS_UNIT}</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  <Sparkle className="w-3 h-3 text-purple-400 fill-current" />
                  {text.LINES_UNIT(material.subtitles?.length || 15)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HubTrendingCarousel;
