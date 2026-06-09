import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@spark-nest-ed/frontend-shared-components';

export interface LearningStat {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

export interface MyLibraryLearningStatsCardProps {
  stats: LearningStat[];
}

const MyLibraryLearningStatsCard: React.FC<MyLibraryLearningStatsCardProps> = ({
  stats,
}) => {
  return (
    <Card className="mb-8">
      <CardHeader className="pb-2">
        <CardTitle>Learning Overview</CardTitle>
        <CardDescription>
          Your vocabulary learning statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="p-4 rounded-lg border bg-card">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${stat.color}`}
              >
                {stat.icon}
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </h3>
              <p className="text-xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyLibraryLearningStatsCard;

