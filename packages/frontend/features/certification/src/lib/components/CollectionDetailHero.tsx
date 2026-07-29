import {
  Star,
  Download,
  Users,
  Copy,
  Layers,
  Share2,
  MoreHorizontal,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import { CollectionViewModel, formatField } from '../hooks/useCollectionDetailContainerLogic';

interface CollectionDetailHeroProps {
  collection: CollectionViewModel;
}

export const CollectionDetailHero = ({
  collection,
}: CollectionDetailHeroProps) => {
  return (
    <div className="space-y-6">
      {/* Breadcrumb & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>Collections</span>
            <span>&gt;</span>
            <span className="text-foreground font-bold">
              {formatField(collection.title, 'Collection Detail')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Collection Overview
          </h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-none font-bold text-[10px]">
              Published
            </Badge>
            {collection.author && (
              <span>
                Created by{' '}
                <strong className="text-foreground">{collection.author}</strong>
              </span>
            )}
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-current" />
            {collection.updatedDate && (
              <span>&bull; Updated {collection.updatedDate}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="text-xs font-bold py-2 px-3.5 rounded-xl border-border bg-card flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm flex items-center gap-1.5">
            Edit Collection
          </Button>
          <Button
            variant="outline"
            className="text-xs p-2.5 rounded-xl border-border bg-card"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Hero Card */}
      <Card className="border-border overflow-hidden bg-card shadow-sm">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Left Poster */}
          <div className="relative w-full md:w-64 aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 text-white p-5 flex flex-col justify-between shadow-lg flex-shrink-0">
            {collection.exam && (
              <Badge className="bg-white/20 backdrop-blur-md text-white border-none text-[10px] font-bold w-fit">
                {collection.exam}
              </Badge>
            )}
            <div>
              <div className="text-xs font-light text-indigo-200 uppercase tracking-widest">
                Collection
              </div>
              <h3 className="text-xl font-extrabold tracking-tight leading-tight mt-1 line-clamp-3">
                {formatField(collection.title, 'Untitled Collection')}
              </h3>
            </div>
            {collection.itemsCount > 0 && (
              <div className="flex items-center justify-between text-[10px] text-indigo-200 border-t border-white/10 pt-2">
                <span>Verified Pack</span>
                <span>{collection.itemsCount} Items</span>
              </div>
            )}
          </div>

          {/* Right Info */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-none font-bold text-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Editor's Pick
              </Badge>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-snug">
              {formatField(collection.title, 'Unnamed Collection')}
            </h2>

            {collection.subtitle ? (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {collection.subtitle}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground/50 italic">
                No description available.
              </p>
            )}

            {collection.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {collection.tags.map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-border text-xs">
              {collection.rating && (
                <div className="flex items-center gap-1.5 font-bold">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-foreground">{collection.rating}</span>
                  {collection.reviewsCount && (
                    <span className="text-muted-foreground font-normal">
                      ({collection.reviewsCount})
                    </span>
                  )}
                </div>
              )}
              {collection.downloads && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Download className="w-4 h-4 text-indigo-500" />
                  <span className="font-bold text-foreground">
                    {collection.downloads}
                  </span>{' '}
                  Downloads
                </div>
              )}
              {collection.followers && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="font-bold text-foreground">
                    {collection.followers}
                  </span>{' '}
                  Followers
                </div>
              )}
              {collection.clones && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Copy className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-foreground">
                    {collection.clones}
                  </span>{' '}
                  Clones
                </div>
              )}
              {collection.itemsCount > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Layers className="w-4 h-4 text-sky-500" />
                  <span className="font-bold text-foreground">
                    {collection.itemsCount}
                  </span>{' '}
                  Items
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
