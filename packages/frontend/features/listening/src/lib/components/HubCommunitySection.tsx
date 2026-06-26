import React from 'react';
import { Globe, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { LISTENING_ROUTES, LISTENING_HUB_TEXT } from '../constants';
import { getDifficultyColor } from '../utils/listening-helpers';
import { Badge, Button } from '@spark-nest-ed/frontend-shared-components';

interface HubCommunitySectionProps {
  communityItems: any[];
  communityScrollRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => void;
  navigate: (route: string) => void;
  handleNavigateContribute: () => void;
}

export const HubCommunitySection: React.FC<HubCommunitySectionProps> = ({
  communityItems,
  communityScrollRef,
  handleScroll,
  navigate,
  handleNavigateContribute,
}) => {
  const text = LISTENING_HUB_TEXT.COMMUNITY;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Globe className="w-5.5 h-5.5 text-primary" />
            {text.TITLE}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-muted-foreground font-medium">{text.SUBTITLE}</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/listening/explore?isCommunity=true')}
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
            onClick={() => handleScroll(communityScrollRef, 'left')}
            className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleScroll(communityScrollRef, 'right')}
            className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={communityScrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
      >
        <div
          onClick={handleNavigateContribute}
          className="min-w-[200px] max-w-[200px] snap-start border-2 border-dashed border-border hover:border-primary bg-card/40 hover:bg-primary/[0.03] p-5 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center gap-3 shrink-0"
        >
          <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:scale-105 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-foreground">{text.ADD_CTA}</h3>
            <p className="text-[10px] text-muted-foreground mt-1 font-semibold">{text.ADD_DESC}</p>
          </div>
        </div>

        {communityItems.length === 0 ? (
          <div className="flex items-center text-xs text-muted-foreground border border-border rounded-2xl px-6 bg-card">
            {text.EMPTY}
          </div>
        ) : (
          communityItems.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(LISTENING_ROUTES.STUDY(item.id))}
              className="min-w-[200px] max-w-[200px] snap-start group bg-card border border-border hover:border-primary/30 p-4 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <Badge className="text-[9px] font-black uppercase bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded">
                  CỘNG ĐỒNG
                </Badge>
                <h3 className="text-xs font-black text-foreground group-hover:text-primary transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-[10px] text-muted-foreground truncate">{text.DEFAULT_AUTHOR}: {item.author || 'Học viên'}</p>
              </div>
              
              <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-3 border-t border-border/60 mt-3">
                <span className="capitalize">{item.category}</span>
                <Badge className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${getDifficultyColor(item.difficulty)}`}>
                  {item.difficulty}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HubCommunitySection;
