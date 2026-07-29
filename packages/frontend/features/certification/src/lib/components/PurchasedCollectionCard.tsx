import React from 'react';
import { Play, Receipt, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import type { PurchasedCollectionItem } from '../hooks/usePurchasedCollectionsContainerLogic';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

interface PurchasedCollectionCardProps {
  item: PurchasedCollectionItem;
  onOpenCollection: (id: string) => void;
  onViewReceipt: (orderId: string, e: React.MouseEvent) => void;
}

export const PurchasedCollectionCard = ({
  item,
  onOpenCollection,
  onViewReceipt,
}: PurchasedCollectionCardProps) => {
  const cardText = CERTIFICATION_UI_TEXT.purchasedCollections.card;

  return (
    <Card
      onClick={() => onOpenCollection(item.id)}
      className="border-border hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg cursor-pointer group overflow-hidden flex flex-col justify-between"
    >
      <CardHeader className="p-4 space-y-3">
        <div className="flex gap-3.5">
          {/* LEFT COVER BANNER */}
          <div
            className={`w-24 h-28 rounded-xl bg-gradient-to-br ${item.coverGradient} p-2.5 flex flex-col justify-between flex-shrink-0 shadow-md relative overflow-hidden`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-black tracking-wider uppercase opacity-90">
                PRO
              </span>
              <Zap className="w-4 h-4 text-amber-400 fill-current" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold leading-tight">
                {item.examType}
              </div>
            </div>
            <Badge className="bg-white/20 backdrop-blur-md text-white border-none text-[8px] font-bold self-start">
              UNLOCKED
            </Badge>
          </div>

          {/* RIGHT CARD CONTENT */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-none text-[10px] font-extrabold px-2 py-0.5">
                {item.accessType}
              </Badge>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {item.pricePaid}
              </span>
            </div>

            <h4 className="font-extrabold text-sm text-foreground group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
              {item.title}
            </h4>

            <span className="text-[10px] text-muted-foreground block font-mono">
              Order #{item.orderId} &bull; Purchased {item.purchaseDate}
            </span>
          </div>
        </div>

        {/* PROGRESS METER */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
            <span>
              {cardText.progressLabel}: <strong className="text-foreground">{item.completedTests} / {item.totalTests} Tests</strong>
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
              {item.progressPercent}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{ width: `${item.progressPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onOpenCollection(item.id);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 px-3 h-8 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {cardText.startLearning}
          </Button>

          <button
            onClick={(e) => onViewReceipt(item.orderId, e)}
            className="flex items-center gap-1 font-bold text-xs text-muted-foreground hover:text-indigo-600 transition-colors cursor-pointer py-1 px-2"
          >
            <Receipt className="w-3.5 h-3.5" />
            {cardText.receiptBtn}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
