import { CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@spark-nest-ed/frontend-shared-components';
import { WhyTrendingReason } from '../hooks/useTrendingContainerLogic';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

interface WhyTrendingCardProps {
  reasons: WhyTrendingReason[];
}

export const WhyTrendingCard = ({
  reasons,
}: WhyTrendingCardProps) => {
  return (
    <Card className="border-border bg-slate-50 dark:bg-slate-900/40">
      <CardHeader className="pb-2 border-b border-border mb-3">
        <CardTitle className="text-sm font-black">
          {CERTIFICATION_UI_TEXT.trending.whyTrendingTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reasons.map((reason, idx) => (
          <div key={idx} className="flex gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${reason.color}`}
            >
              <CheckCircle2 className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h4 className="text-xs font-black text-foreground leading-tight">
                {reason.title}
              </h4>
              <p className="text-[9px] text-muted-foreground mt-1 leading-relaxed">
                {reason.desc}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
