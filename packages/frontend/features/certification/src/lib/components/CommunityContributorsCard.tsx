import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@spark-nest-ed/frontend-shared-components';
import { Contributor } from '../types';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

interface CommunityContributorsCardProps {
  contributors: Contributor[];
}

export const CommunityContributorsCard = ({
  contributors,
}: CommunityContributorsCardProps) => {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base font-bold">
          {CERTIFICATION_UI_TEXT.community.topContributors}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {contributors.map((contributor) => (
            <div
              key={contributor.rank}
              className="p-3 rounded-xl border border-border bg-card flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                #{contributor.rank}
              </div>
              <div className="truncate">
                <div className="font-bold text-xs text-foreground truncate">
                  {contributor.name}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {contributor.points} XP
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
