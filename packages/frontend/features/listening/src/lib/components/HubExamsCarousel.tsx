import React from 'react';
import { Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { LISTENING_ROUTES, LISTENING_HUB_TEXT } from '../constants';
import { getDifficultyColor } from '../utils/listening-helpers';
import { Badge, Button } from '@spark-nest-ed/frontend-shared-components';

interface HubExamsCarouselProps {
  exams: any[];
  examsScrollRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => void;
  navigate: (route: string) => void;
}

export const HubExamsCarousel: React.FC<HubExamsCarouselProps> = ({
  exams,
  examsScrollRef,
  handleScroll,
  navigate,
}) => {
  const text = LISTENING_HUB_TEXT.EXAMS;

  if (exams.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Award className="w-5.5 h-5.5 text-emerald-505" />
            {text.TITLE}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-muted-foreground font-medium">{text.SUBTITLE}</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/listening/explore?category=exam')}
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
            onClick={() => handleScroll(examsScrollRef, 'left')}
            className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleScroll(examsScrollRef, 'right')}
            className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={examsScrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
      >
        {exams.map((exam) => (
          <div
            key={exam.id}
            onClick={() => navigate(LISTENING_ROUTES.STUDY(exam.id))}
            className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-start group relative flex items-center bg-card border border-border hover:border-emerald-500/35 p-4 rounded-2xl transition-all duration-300 cursor-pointer gap-4"
          >
            <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden border border-border shrink-0 flex items-center justify-center">
              {exam.thumbnailUrl ? (
                <img src={exam.thumbnailUrl} alt={exam.title} className="w-full h-full object-cover" />
              ) : (
                <Award className="w-7 h-7 text-emerald-455/40" />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <h3 className="text-xs font-extrabold text-foreground line-clamp-1 group-hover:text-emerald-455 transition-colors">
                {exam.title}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${getDifficultyColor(exam.difficulty)}`}>
                  {exam.difficulty}
                </Badge>
                {exam.questions && exam.questions.length > 0 && (
                  <Badge className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {text.QUESTIONS_UNIT(exam.questions.length)}
                  </Badge>
                )}
              </div>
              <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1 border-t border-border/60">
                <span>{exam.viewCount} {text.VIEWS_UNIT}</span>
                <span className="text-muted-foreground font-semibold">{text.MINUTES_UNIT(Math.floor(exam.duration / 60))}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HubExamsCarousel;
