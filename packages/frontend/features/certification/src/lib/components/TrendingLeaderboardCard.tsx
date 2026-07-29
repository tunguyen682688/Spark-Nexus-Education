import { Flame, Bookmark } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import { ExamCollection } from '../types';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

interface TrendingLeaderboardCardProps {
  collections: ExamCollection[];
  bookmarkedCollectionIds: string[];
  onBookmark: (id: string) => void;
}

export const TrendingLeaderboardCard = ({
  collections,
  bookmarkedCollectionIds,
  onBookmark,
}: TrendingLeaderboardCardProps) => {
  return (
    <Card className="xl:col-span-2 border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border mb-2">
        <div>
          <CardTitle className="text-sm font-black flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500 fill-current" />
            {CERTIFICATION_UI_TEXT.trending.leaderboardTitle}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground/60 font-bold text-[10px]">
                <th className="py-2.5 px-4 w-12 text-center">
                  {CERTIFICATION_UI_TEXT.trending.tableHeaders.rank}
                </th>
                <th className="py-2.5 px-4">
                  {CERTIFICATION_UI_TEXT.trending.tableHeaders.collection}
                </th>
                <th className="py-2.5 px-4 w-20 text-center">
                  {CERTIFICATION_UI_TEXT.trending.tableHeaders.exam}
                </th>
                <th className="py-2.5 px-4 w-20 text-center">
                  {CERTIFICATION_UI_TEXT.trending.tableHeaders.trend}
                </th>
                <th className="py-2.5 px-4 w-24 text-center">
                  {CERTIFICATION_UI_TEXT.trending.tableHeaders.action}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {collections.slice(0, 10).map((collectionItem, rankIndex) => (
                <tr
                  key={collectionItem.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                >
                  <td className="py-2.5 px-4 text-center font-bold text-muted-foreground">
                    #{rankIndex + 1}
                  </td>
                  <td className="py-2.5 px-4 font-extrabold text-foreground text-xs">
                    {collectionItem.title}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <Badge
                      variant="outline"
                      className="text-[8px] py-0.5 px-1.5 font-black uppercase border-indigo-200 text-indigo-700 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-300"
                    >
                      {collectionItem.exam}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 text-center font-black text-emerald-600 dark:text-emerald-400">
                    {collectionItem.trend || '+15%'}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <button
                      onClick={() => onBookmark(collectionItem.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        bookmarkedCollectionIds.includes(collectionItem.id)
                          ? 'bg-amber-50 text-amber-600 border-amber-300'
                          : 'text-muted-foreground hover:text-indigo-600'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
