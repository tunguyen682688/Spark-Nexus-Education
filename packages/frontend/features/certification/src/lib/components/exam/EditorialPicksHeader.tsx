import { Award } from 'lucide-react';
import { Card, CardContent, Badge } from '@spark-nest-ed/frontend-shared-components';
import { EditorialBadgeItem } from '../../hooks/container-logic/browse/use-editorial-picks-container-logic';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

interface EditorialPicksHeaderProps {
  badges: EditorialBadgeItem[];
}

export const EditorialPicksHeader = ({
  badges,
}: EditorialPicksHeaderProps) => {
  return (
    <div className="space-y-6">
      {/* HERO TITLE BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white p-6 sm:p-8 md:p-10 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative max-w-xl space-y-3 z-10">
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-1 px-3 text-xs backdrop-blur-sm">
            <span role="img" aria-label="sparkles">
              ✨
            </span>{' '}
            {CERTIFICATION_UI_TEXT.editorialPicks.badgeTag}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {CERTIFICATION_UI_TEXT.editorialPicks.title}
          </h1>
          <p className="text-sm text-purple-100 font-light max-w-md">
            {CERTIFICATION_UI_TEXT.editorialPicks.subtitle}
          </p>
        </div>
      </div>

      {/* TOP BADGES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map((badge, idx) => (
          <Card
            key={idx}
            className="border-border hover:shadow-sm transition-all duration-300"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${badge.color}`}
              >
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-foreground">
                  {badge.title}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {badge.desc}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
