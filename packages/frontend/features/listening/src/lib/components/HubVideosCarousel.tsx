import React from 'react';
import { Video, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
import { LISTENING_ROUTES, LISTENING_HUB_TEXT } from '../constants';

interface HubVideosCarouselProps {
  videos: any[];
  videosScrollRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => void;
  navigate: (route: string) => void;
}

export const HubVideosCarousel: React.FC<HubVideosCarouselProps> = ({
  videos,
  videosScrollRef,
  handleScroll,
  navigate,
}) => {
  const text = LISTENING_HUB_TEXT.VIDEOS;

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

  if (videos.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Video className="w-5.5 h-5.5 text-red-500" />
            {text.TITLE}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-muted-foreground font-medium">{text.SUBTITLE}</p>
            <button
              onClick={() => navigate('/listening/explore?category=video')}
              className="text-[10px] font-black text-primary hover:text-primary/80 hover:underline shrink-0"
            >
              {text.VIEW_ALL}
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll(videosScrollRef, 'left')}
            className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll(videosScrollRef, 'right')}
            className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={videosScrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
      >
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => navigate(LISTENING_ROUTES.STUDY(video.id))}
            className="min-w-[260px] sm:min-w-[300px] max-w-[300px] snap-start group bg-card border border-border hover:border-primary/40 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div className="relative aspect-video w-full bg-muted">
              {video.thumbnailUrl ? (
                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-10 h-10 text-red-500/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <div className="p-3 bg-red-600 rounded-full text-white shadow-lg">
                  <PlayCircle className="w-6 h-6 fill-current" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[9px] font-bold bg-background/80 text-foreground rounded border border-border">
                {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="p-4 space-y-2">
              <h3 className="text-xs font-black text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {video.title}
              </h3>
              <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-2 border-t border-border/65">
                <span>{text.DEFAULT_AUTHOR}</span>
                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${getDifficultyColor(video.difficulty)}`}>
                  {video.difficulty}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HubVideosCarousel;
