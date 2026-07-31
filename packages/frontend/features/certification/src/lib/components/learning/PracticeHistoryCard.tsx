import React from 'react';
import { Eye, RotateCcw, MoreVertical, FileText, Headphones, Mic, PenTool, Sparkles, Brain } from 'lucide-react';
import { Badge } from '@spark-nest-ed/frontend-shared-components';
import type { PracticeHistorySessionItem } from '../../hooks/container-logic/learning/use-practice-history-container-logic';

interface PracticeHistoryCardProps {
  item: PracticeHistorySessionItem;
  onViewScorecard: (id: string) => void;
  onRetakeTest: (id: string, e: React.MouseEvent) => void;
}

export const PracticeHistoryCard = ({
  item,
  onViewScorecard,
  onRetakeTest,
}: PracticeHistoryCardProps) => {
  const renderIcon = (type: string) => {
    switch (type) {
      case 'listening':
        return <Headphones className="w-4 h-4 text-purple-600" />;
      case 'reading':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'speaking':
        return <Mic className="w-4 h-4 text-amber-600" />;
      case 'writing':
        return <PenTool className="w-4 h-4 text-emerald-600" />;
      case 'ai':
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
      default:
        return <Brain className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <tr
      className="hover:bg-secondary/20 transition-colors group cursor-pointer"
      onClick={() => onViewScorecard(item.id)}
    >
      {/* Session Title & Icon */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBgClass}`}
          >
            {renderIcon(item.iconType)}
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-foreground group-hover:text-indigo-600 transition-colors">
              {item.title}
            </h4>
            <span className="text-[10px] text-muted-foreground block font-mono">
              {item.code}
            </span>
          </div>
        </div>
      </td>

      {/* Type Badge */}
      <td className="py-3.5 px-4">
        <Badge
          className={`text-[10px] font-bold border-none px-2 py-0.5 ${item.typeBadgeClass}`}
        >
          {item.type}
        </Badge>
      </td>

      {/* Exam / Part */}
      <td className="py-3.5 px-4 font-semibold text-muted-foreground">
        {item.examPart}
      </td>

      {/* Score */}
      <td className="py-3.5 px-4">
        <div className="font-black text-sm text-foreground">
          {item.scoreDisplay}
        </div>
        <span className={`text-[10px] font-bold ${item.scoreColor}`}>
          {item.scoreSub}
        </span>
      </td>

      {/* Time */}
      <td className="py-3.5 px-4 font-semibold text-muted-foreground">
        {item.timeSpent}
      </td>

      {/* Date */}
      <td className="py-3.5 px-4 text-[11px] text-muted-foreground">
        {item.dateDisplay}
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewScorecard(item.id);
            }}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-indigo-600 transition-colors cursor-pointer"
            title="View Scorecard"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => onRetakeTest(item.id, e)}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-indigo-600 transition-colors cursor-pointer"
            title="Retake Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
