import React from 'react';
import { Award, Eye, FileCheck, TrendingUp, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, Badge } from '@spark-nest-ed/frontend-shared-components';
import type { CompletedCollectionCardItem } from '../hooks/useCompletedCollectionsContainerLogic';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

interface CompletedCollectionCardProps {
  item: CompletedCollectionCardItem;
  onOpenCollection: (id: string) => void;
  onViewCertificate: (id: string, e: React.MouseEvent) => void;
  onViewAnalytics: (id: string, e: React.MouseEvent) => void;
}

export const CompletedCollectionCard: React.FC<CompletedCollectionCardProps> = ({
  item,
  onOpenCollection,
  onViewCertificate,
  onViewAnalytics,
}) => {
  const cardText = CERTIFICATION_UI_TEXT.completedCollections.card;

  return (
    <Card
      onClick={() => onOpenCollection(item.id)}
      className="border-border hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg cursor-pointer group overflow-hidden flex flex-col justify-between"
    >
      <CardHeader className="p-4 pb-2 space-y-3">
        <div className="flex gap-3">
          {/* LEFT COVER BANNER */}
          <div
            className={`w-24 h-28 rounded-xl bg-gradient-to-br ${item.gradientClass} text-white p-2.5 flex flex-col justify-between flex-shrink-0 shadow-md relative overflow-hidden`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-black tracking-wider uppercase opacity-90">
                {item.coverTitle}
              </span>
              <Award className={`w-4 h-4 ${item.medalColor}`} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold leading-tight">
                {item.coverSubtitle}
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-[10px] font-bold">
              &check;
            </div>
          </div>

          {/* RIGHT CARD INFO */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-none text-[10px] font-extrabold px-2 py-0.5">
                {cardText.completedBadge} &check;
              </Badge>
            </div>
            <h4 className="font-extrabold text-xs text-foreground group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
              {item.title}
            </h4>
          </div>
        </div>

        {/* PROGRESS BAR 100% */}
        <div className="space-y-1 pt-1">
          <div className="w-full h-1.5 bg-emerald-100 dark:bg-emerald-950/40 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-full" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium pt-1">
            <span>
              {cardText.scoreLabel}: <strong className="text-foreground">{item.score}</strong>
            </span>
            <span>
              {cardText.timeLabel}: <strong className="text-foreground">{item.timeSpent}</strong>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
              100%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        <div className="text-[10px] text-muted-foreground border-t border-border/50 pt-2 flex items-center justify-between">
          <span>{cardText.completedOn} {item.completedDate}</span>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40 gap-1 text-[11px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenCollection(item.id);
            }}
            className="flex items-center gap-1 font-bold text-muted-foreground hover:text-indigo-600 transition-colors cursor-pointer py-1 px-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-500" />
            {cardText.reviewBtn}
          </button>

          <button
            onClick={(e) => onViewCertificate(item.id, e)}
            className="flex items-center gap-1 font-bold text-muted-foreground hover:text-indigo-600 transition-colors cursor-pointer py-1 px-1.5"
          >
            <FileCheck className="w-3.5 h-3.5 text-purple-500" />
            {cardText.certificateBtn}
          </button>

          <button
            onClick={(e) => onViewAnalytics(item.id, e)}
            className="flex items-center gap-1 font-bold text-muted-foreground hover:text-indigo-600 transition-colors cursor-pointer py-1 px-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            {cardText.analyticsBtn}
          </button>

          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
