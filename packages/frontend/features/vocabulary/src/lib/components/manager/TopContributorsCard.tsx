import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@spark-nest-ed/frontend-shared-components';
import { Users } from 'lucide-react';

export interface Contributor {
  name: string;
  sets: number;
  followers: number;
}

export interface TopContributorsCardProps {
  contributors: readonly Contributor[];
}

const TopContributorsCard: React.FC<TopContributorsCardProps> = ({
  contributors,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Top Contributors
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contributors.map((contributor, index) => (
            <div
              key={contributor.name}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{contributor.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {contributor.sets} sets • {contributor.followers} followers
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopContributorsCard;

