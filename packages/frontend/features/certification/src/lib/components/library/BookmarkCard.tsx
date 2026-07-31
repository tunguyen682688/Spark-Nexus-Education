import React from 'react';
import { Bookmark, Eye, Trash2, MoreVertical, FileText, Headphones, Mic, PenTool, BookA, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, Badge } from '@spark-nest-ed/frontend-shared-components';
import type { BookmarkItem } from '../../hooks/container-logic/library/use-bookmarks-container-logic';

interface BookmarkCardProps {
  item: BookmarkItem;
  onOpenItem: (id: string) => void;
  onRemoveBookmark: (id: string, e: React.MouseEvent) => void;
}

export const BookmarkCard = ({
  item,
  onOpenItem,
  onRemoveBookmark,
}: BookmarkCardProps) => {
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
        return <Bookmark className="w-5 h-5" />;
    }
  };

  return (
    <Card
      onClick={() => onOpenItem(item.id)}
      className="border-border hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg cursor-pointer group overflow-hidden flex flex-col justify-between"
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
              <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-none text-[10px] font-extrabold px-2 py-0.5">
                {item.type}
              </Badge>
              <span className="text-[10px] font-bold text-muted-foreground">
                {item.folderName}
              </span>
            </div>

            <h4 className="font-extrabold text-sm text-foreground group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
              {item.title}
            </h4>

            <p className="text-xs text-muted-foreground line-clamp-1 font-medium">
              {item.subtitle}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        <div className="text-[10px] text-muted-foreground border-t border-border/50 pt-2 flex items-center justify-between font-mono">
          <span>Bookmarked on {item.bookmarkedOn}</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {item.folderName}
          </span>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenItem(item.id);
            }}
            className="flex items-center gap-1 font-bold text-xs text-indigo-600 hover:underline transition-colors cursor-pointer py-1"
          >
            <Eye className="w-3.5 h-3.5" />
            Open Item
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => onRemoveBookmark(item.id, e)}
              className="p-1.5 rounded text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
              title="Remove Bookmark"
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
