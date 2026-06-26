import React from 'react';
import { Headset, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
import { LISTENING_ROUTES, LISTENING_HUB_TEXT } from '../constants';
import { getDifficultyColor } from '../utils/listening-helpers';
import { Badge, Button } from '@spark-nest-ed/frontend-shared-components';

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

  if (podcasts.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Headset className="w-5.5 h-5.5 text-primary" />
            {text.TITLE}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-muted-foreground font-medium">{text.SUBTITLE}</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/listening/explore?category=podcast')}
              className="text-[10px] font-black text-primary hover:text-primary/80 p-0 h-auto"
            >
              {text.VIEW_ALL}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleScroll(podcastsScrollRef, 'left')}
            className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleScroll(podcastsScrollRef, 'right')}
            className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
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
            className="min-w-[170px] sm:min-w-[190px] max-w-[190px] snap-start group bg-card border border-border hover:border-primary/40 p-3.5 rounded-2xl transition-all duration-300 cursor-pointer text-center flex flex-col items-center justify-between"
          >
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted mb-3">
              {podcast.thumbnailUrl ? (
                <img
                  src={podcast.thumbnailUrl}
                  alt={podcast.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <PlayCircle className="w-10 h-10 text-primary/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <div className="p-2.5 bg-primary rounded-full shadow-lg text-primary-foreground">
                  <PlayCircle className="w-6 h-6 fill-current" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[9px] font-bold bg-background/80 backdrop-blur text-foreground rounded border border-border">
                {text.DURATION_UNIT(Math.floor(podcast.duration / 60))}
              </span>
            </div>
            <div className="w-full flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-foreground line-clamp-2 text-left mb-1 group-hover:text-primary transition-colors">
                  {podcast.title}
                </h3>
                <p className="text-[10px] text-muted-foreground text-left truncate">{podcast.author || text.DEFAULT_AUTHOR}</p>
              </div>
              <Badge className={`mt-2 w-fit text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${getDifficultyColor(podcast.difficulty)}`}>
                {podcast.difficulty}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HubPodcastsCarousel;
