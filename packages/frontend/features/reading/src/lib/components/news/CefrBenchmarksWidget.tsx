import React from 'react';
import { BookOpen } from 'lucide-react';
import { READING_UI_TEXT } from '../../constants';
import { CEFR_BENCHMARKS } from '../../constants';

interface CefrBenchmarksWidgetProps {
  handleLevelChange: (level: string) => void;
}

const cefrBenchmarks = CEFR_BENCHMARKS;

export const CefrBenchmarksWidget: React.FC<CefrBenchmarksWidgetProps> = ({
  handleLevelChange,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4 transition-all duration-300 hover:shadow-md">
      <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-base">
        <BookOpen className="w-4 h-4 text-blue-500" /> {READING_UI_TEXT.components.news.BENCHMARKS_TITLE}
      </h4>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
        {READING_UI_TEXT.components.news.BENCHMARKS_DESC}
      </p>
      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner bg-slate-50/20 dark:bg-slate-950/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-950/80 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <th className="py-2.5 px-3">{READING_UI_TEXT.components.news.BENCHMARKS_LEVEL}</th>
              <th className="py-2.5 px-3">{READING_UI_TEXT.components.news.BENCHMARKS_TARGET_WPM}</th>
              <th className="py-2.5 px-3">{READING_UI_TEXT.components.news.BENCHMARKS_LENGTH}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {cefrBenchmarks.map((row) => (
              <tr
                key={row.level}
                onClick={() => handleLevelChange(row.level)}
                className="text-xs hover:bg-slate-100 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
              >
                <td className="py-2.5 px-3 font-extrabold text-blue-600 dark:text-blue-400">
                  {row.level}
                </td>
                <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                  {row.wpm}
                </td>
                <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                  {row.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
