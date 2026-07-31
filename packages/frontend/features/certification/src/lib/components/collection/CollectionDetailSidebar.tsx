import {
  Play,
  Bookmark,
  Copy,
  Flag,
  CheckCircle2,
  RefreshCw,
  Pencil,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@spark-nest-ed/frontend-shared-components';
import {
  CollectionViewModel,
  formatField,
} from '../../hooks/container-logic/collection/use-collection-detail-container-logic';
import { ComingSoonSection } from '../shared/ComingSoonSection';

interface CollectionDetailSidebarProps {
  collection: CollectionViewModel;
  isStartingExamSession: boolean;
  isSaving: boolean;
  isCloning: boolean;
  isReporting: boolean;
  isCollectionBookmarked: boolean;
  isCollectionCloned: boolean;
  isOwner?: boolean;
  onStartLearning: () => void;
  onToggleBookmark: () => void;
  onToggleClone: () => void;
  onReport: () => void;
  onEditCollection?: () => void;
}

export const CollectionDetailSidebar = ({
  collection,
  isStartingExamSession,
  isSaving,
  isCloning,
  isReporting,
  isCollectionBookmarked,
  isCollectionCloned,
  isOwner = false,
  onStartLearning,
  onToggleBookmark,
  onToggleClone,
  onReport,
  onEditCollection,
}: CollectionDetailSidebarProps) => {
  return (
    <div className="space-y-6">
      {/* ABOUT THIS COLLECTION */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">
            About This Collection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 text-xs">
          {[
            { label: 'Difficulty Level', value: collection.level },
            { label: 'Target Band', value: collection.targetBand },
            { label: 'CEFR Level', value: collection.cefrLevel },
            { label: 'Language', value: collection.language },
            { label: 'Last Updated', value: collection.updatedDate },
            { label: 'Total Size', value: collection.totalSize },
          ].map(({ label, value }, idx, arr) => (
            <div
              key={label}
              className={`flex justify-between py-2 ${
                idx < arr.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <span className="text-muted-foreground">{label}</span>
              <span
                className={`font-bold ${
                  value ? 'text-foreground' : 'text-muted-foreground/40'
                }`}
              >
                {formatField(value)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* QUICK ACTIONS */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            disabled={isStartingExamSession}
            onClick={onStartLearning}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md cursor-pointer"
          >
            {isStartingExamSession ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            Start Learning
          </Button>

          {isOwner && onEditCollection && (
            <Button
              onClick={onEditCollection}
              variant="outline"
              className="w-full text-xs font-bold py-2.5 rounded-xl border-border flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
              Edit Collection
            </Button>
          )}

          <Button
            disabled={isSaving}
            onClick={onToggleBookmark}
            variant="outline"
            className={`w-full text-xs font-bold py-2.5 rounded-xl border-border ${
              isCollectionBookmarked
                ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                : ''
            }`}
          >
            <Bookmark className="w-4 h-4 mr-1.5 fill-current" />
            {isCollectionBookmarked ? 'Saved to Library \u2713' : 'Add to Saved'}
          </Button>

          <Button
            disabled={isCloning}
            onClick={onToggleClone}
            variant="outline"
            className={`w-full text-xs font-bold py-2.5 rounded-xl border-border ${
              isCollectionCloned
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : ''
            }`}
          >
            <Copy className="w-4 h-4 mr-1.5" />
            {isCollectionCloned ? 'Collection Cloned \u2713' : 'Clone Collection'}
          </Button>

          <Button
            disabled={isReporting}
            onClick={onReport}
            variant="outline"
            className="w-full text-xs font-bold py-2.5 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-950/40 dark:hover:bg-rose-950/20"
          >
            <Flag className="w-4 h-4 mr-1.5" />
            Report Collection
          </Button>
        </CardContent>
      </Card>

      {/* CREATOR CARD */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">Creator Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!collection.author ? (
            <ComingSoonSection
              title="Creator info unavailable"
              description="Author information for this collection is not available yet."
            />
          ) : (
            <>
              <div className="flex items-center gap-3">
                {collection.authorAvatar ? (
                  <img
                    src={collection.authorAvatar}
                    alt={collection.author}
                    className="w-12 h-12 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-lg font-bold text-indigo-600 border border-border">
                    {collection.author.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-sm text-foreground">
                      {collection.author}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-blue-500 fill-current" />
                  </div>
                  {collection.authorRole && (
                    <div className="text-xs text-muted-foreground">
                      {collection.authorRole}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full text-xs font-bold py-2.5 rounded-xl border-border"
              >
                View Creator Profile
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
