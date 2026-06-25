import React from 'react';
import { Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { LISTENING_ROUTES, LISTENING_HUB_TEXT } from '../constants';

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

  if (exams.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <Award className="w-5.5 h-5.5 text-emerald-455" />
            {text.TITLE}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-slate-500 font-medium">{text.SUBTITLE}</p>
            <button
              onClick={() => navigate('/listening/explore?category=exam')}
              className="text-[10px] font-black text-purple-400 hover:text-purple-300 hover:underline shrink-0"
            >
              {text.VIEW_ALL}
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll(examsScrollRef, 'left')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-455 hover:text-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll(examsScrollRef, 'right')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-455 hover:text-slate-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
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
            className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-start group relative flex items-center bg-slate-900/30 hover:bg-slate-900/60 border border-slate-850 hover:border-emerald-500/35 p-4 rounded-2xl transition-all duration-300 cursor-pointer gap-4"
          >
            <div className="w-16 h-16 rounded-xl bg-slate-950 overflow-hidden border border-slate-850 shrink-0 flex items-center justify-center">
              {exam.thumbnailUrl ? (
                <img src={exam.thumbnailUrl} alt={exam.title} className="w-full h-full object-cover" />
              ) : (
                <Award className="w-7 h-7 text-emerald-455/40" />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <h3 className="text-xs font-extrabold text-slate-200 line-clamp-1 group-hover:text-emerald-455 transition-colors">
                {exam.title}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${getDifficultyColor(exam.difficulty)}`}>
                  {exam.difficulty}
                </span>
                {exam.questions && exam.questions.length > 0 && (
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {text.QUESTIONS_UNIT(exam.questions.length)}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-850">
                <span>{exam.viewCount} {text.VIEWS_UNIT}</span>
                <span className="text-slate-400 font-semibold">{text.MINUTES_UNIT(Math.floor(exam.duration / 60))}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HubExamsCarousel;
