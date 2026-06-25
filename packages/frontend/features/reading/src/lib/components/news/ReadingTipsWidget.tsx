import React from 'react';
import { Sparkles } from 'lucide-react';
import { READING_TIPS, READING_UI_TEXT } from '../../constants';

interface ReadingTipsWidgetProps {
  tipIndex: number;
  setTipIndex: React.Dispatch<React.SetStateAction<number>>;
}

const tips = READING_TIPS;

export const ReadingTipsWidget: React.FC<ReadingTipsWidgetProps> = ({
  tipIndex,
  setTipIndex,
}) => {
  const handleNextTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTipIndex((prev) => (prev + 1) % tips.length);
  };

  const activeTip = tips[tipIndex] || tips[0];

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-md space-y-3 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
        <Sparkles className="w-32 h-32" />
      </div>
      <div className="flex justify-between items-center relative z-10">
        <span className="text-[9px] font-extrabold bg-white/20 px-2.5 py-1 rounded-full tracking-wider uppercase backdrop-blur-sm">
          {READING_UI_TEXT.components.news.TIPS_PRO}
        </span>
        <button
          onClick={handleNextTip}
          className="text-[9px] font-bold bg-white/10 hover:bg-white/20 active:bg-white/30 px-2.5 py-1 rounded-full uppercase transition-colors cursor-pointer"
        >
          {READING_UI_TEXT.components.news.TIPS_NEXT}
        </button>
      </div>
      <h5 className="font-bold text-sm leading-snug relative z-10 transition-all duration-300">
        {activeTip.title}
      </h5>
      <p className="text-xs text-white/85 leading-relaxed relative z-10 min-h-[70px] transition-all duration-300">
        {activeTip.content}
      </p>
    </div>
  );
};
