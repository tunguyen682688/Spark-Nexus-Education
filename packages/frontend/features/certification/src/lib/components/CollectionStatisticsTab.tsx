import React from 'react';
import { BarChart2, Star, Users, Layers, Award, HardDrive } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@spark-nest-ed/frontend-shared-components';

interface CollectionStatisticsTabProps {
  rating?: string;
  reviewsCount?: string;
  downloads?: string;
  clones?: string;
  itemsCount?: number;
  cefrLevel?: string;
  targetBand?: string;
  totalSize?: string;
}

export const CollectionStatisticsTab: React.FC<CollectionStatisticsTabProps> = ({
  rating = '4.9',
  reviewsCount = '2.4K',
  downloads = '58.3K',
  clones = '8.6K',
  itemsCount = 143,
  cefrLevel = 'B2 – C1',
  targetBand = '6.0 – 8.0+',
  totalSize = '45.2 MB',
}) => {
  const statCards = [
    {
      label: 'Learner Rating',
      val: `${rating} ⭐`,
      sub: `${reviewsCount} total reviews`,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
      icon: Star,
    },
    {
      label: 'Learners Enrolled',
      val: downloads,
      sub: `${clones} active clones`,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
      icon: Users,
    },
    {
      label: 'Practice Items',
      val: `${itemsCount}`,
      sub: 'Questions & materials',
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20',
      icon: Layers,
    },
    {
      label: 'Target Level',
      val: cefrLevel,
      sub: `Band ${targetBand}`,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20',
      icon: Award,
    },
    {
      label: 'Resource Size',
      val: totalSize,
      sub: 'Instant offline access',
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20',
      icon: HardDrive,
    },
  ];

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-600" /> Analytics &amp; Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* STATS CARDS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-border flex flex-col justify-between space-y-2 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div className={`p-1.5 rounded-lg ${stat.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <div className="text-lg font-black text-foreground">
                    {stat.val}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {stat.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
