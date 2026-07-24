import React from 'react';
import { Card, CardContent } from '@spark-nest-ed/frontend-shared-components';
import { DashboardStatCard } from '../hooks/useDashboardContainerLogic';

interface DashboardStatsGridProps {
  stats: DashboardStatCard[];
}

export const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({
  stats,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card
            key={idx}
            className="hover:shadow-md transition-shadow duration-300 border-border bg-card"
          >
            <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs text-muted-foreground font-medium">
                  {stat.title}
                </span>
                <div className={`p-1.5 rounded-lg ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                  <span className="font-semibold text-foreground">
                    {stat.subtitle}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {stat.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
