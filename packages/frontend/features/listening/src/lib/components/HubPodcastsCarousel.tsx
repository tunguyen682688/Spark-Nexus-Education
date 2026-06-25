import React from 'react';
import { Headset, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
import { LISTENING_ROUTES, LISTENING_HUB_TEXT } from '../constants';

interface HubPodcastsCarouselProps {
  podcasts: any[];
  podcastsScrollRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => void;
  navigate: (route: string) => void;
}

export const HubPodcastsCarousel: React.FC<HubPodcastsCarouselProps> = ({
  podcasts,
  podcastsScrollRef,
  handleScroll,
  navigate,
}) => {
  const text = LISTENING_HUB_TEXT.PODCASTS;

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

  if (podcasts.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <Headset className="w-5.5 h-5.5 text-purple-400" />
            {text.TITLE}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-slate-500 font-medium">{text.SUBTITLE}</p>
            <button
              onClick={() => navigate('/listening/explore?category=podcast')}
              className="text-[10px] font-black text-purple-400 hover:text-purple-300 hover:underline shrink-0"
            >
              {text.VIEW_ALL}
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll(podcastsScrollRef, 'left')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-455 hover:text-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll(podcastsScrollRef, 'right')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-455 hover:text-slate-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={podcastsScrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
      >
        {podcasts.map((podcast) => (
          <div
            key={podcast.id}
            onClick={() => navigate(LISTENING_ROUTES.STUDY(podcast.id))}
            className="min-w-[170px] sm:min-w-[190px] max-w-[190px] snap-start group bg-slate-900/50 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 p-3.5 rounded-2xl transition-all duration-300 cursor-pointer text-center flex flex-col items-center justify-between"
          >
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950 mb-3">
              {podcast.thumbnailUrl ? (
                <img
                  src={podcast.thumbnailUrl}
                  alt={podcast.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-950/20">
                  <PlayCircle className="w-10 h-10 text-purple-400/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <div className="p-2.5 bg-purple-650 rounded-full shadow-lg text-white">
                  <PlayCircle className="w-6 h-6 fill-current" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[9px] font-bold bg-slate-950/80 backdrop-blur text-slate-300 rounded border border-slate-800">
                {text.DURATION_UNIT(Math.floor(podcast.duration / 60))}
              </span>
            </div>
            <div className="w-full flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-200 line-clamp-2 text-left mb-1 group-hover:text-purple-400 transition-colors">
                  {podcast.title}
                </h3>
                <p className="text-[10px] text-slate-500 text-left truncate">{podcast.author || text.DEFAULT_AUTHOR}</p>
              </div>
              <span className={`mt-2 block w-fit text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${getDifficultyColor(podcast.difficulty)}`}>
                {podcast.difficulty}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HubPodcastsCarousel;
