import React from 'react';
import { Heart, Eye, Trash2, MoreVertical, FileText, Headphones, Mic, PenTool, BookA, GraduationCap, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, Badge } from '@spark-nest-ed/frontend-shared-components';
import type { FavoriteItem } from '../../hooks/container-logic/library/use-favorites-container-logic';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

interface FavoriteCardProps {
  item: FavoriteItem;
  onOpenItem: (id: string) => void;
  onRemoveFavorite: (id: string, e: React.MouseEvent) => void;
}

export const FavoriteCard = ({
  item,
  onOpenItem,
  onRemoveFavorite,
}: FavoriteCardProps) => {
  const cardText = CERTIFICATION_UI_TEXT.favorites.card;

  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case 'listening':
        return <Headphones className="w-5 h-5" />;
      case 'reading':
        return <FileText className="w-5 h-5" />;
      case 'speaking':
        return <Mic className="w-5 h-5" />;
      case 'writing':
        return <PenTool className="w-5 h-5" />;
      case 'vocab':
        return <BookA className="w-5 h-5" />;
      case 'grammar':
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <Heart className="w-5 h-5 fill-current" />;
    }
  };

  return (
    <Card
      onClick={() => onOpenItem(item.id)}
      className="border-border hover:border-rose-500/50 transition-all duration-300 hover:shadow-lg cursor-pointer group overflow-hidden flex flex-col justify-between"
    >
      <CardHeader className="p-4 pb-2 space-y-3">
        <div className="flex gap-3">
          {/* LEFT ICON CONTAINER */}
          <div
            className={`w-12 h-12 rounded-2xl ${item.bannerBgClass} flex items-center justify-center flex-shrink-0 shadow-sm`}
          >
            {renderIcon(item.iconType)}
          </div>

          {/* RIGHT CONTENT */}
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-none text-[10px] font-extrabold px-2 py-0.5">
                {item.type}
              </Badge>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                <Star className="w-3 h-3 fill-current" />
                {item.stat1Value || '4.9'}
              </div>
            </div>

            <h4 className="font-extrabold text-sm text-foreground group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
              {item.title}
            </h4>

            <p className="text-xs text-muted-foreground line-clamp-1 font-medium">
              {item.itemCountText}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        <div className="text-[10px] text-muted-foreground border-t border-border/50 pt-2 flex items-center justify-between font-mono">
          <span>{cardText.favoritedOn} {item.addedDate}</span>
          <span className="font-bold text-rose-600 dark:text-rose-400">
            {item.stat2Value || 'Active'}
          </span>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenItem(item.id);
            }}
            className="flex items-center gap-1 font-bold text-xs text-rose-600 hover:underline transition-colors cursor-pointer py-1"
          >
            <Eye className="w-3.5 h-3.5" />
            {cardText.startBtn}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => onRemoveFavorite(item.id, e)}
              className="p-1.5 rounded text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
              title={cardText.removeBtn}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
