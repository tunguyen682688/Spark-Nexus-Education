import { ExternalLink } from 'lucide-react';
import { Card } from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';

interface QualityCardProps {
  qualityScore?: number;
}

export function QualityCard({ qualityScore = 92 }: QualityCardProps) {
  const questionBuilderText = CERTIFICATION_UI_TEXT.questionBuilder;

  return (
    <Card className="border-border shadow-sm bg-card p-4 space-y-3">
      <h4 className="font-extrabold text-xs uppercase tracking-wider text-foreground pb-2 border-b border-border">
        {questionBuilderText.propertiesSidebar.qualityTitle}
      </h4>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-black text-lg text-emerald-600 flex-shrink-0">
          {qualityScore}
        </div>
        <div>
          <div className="font-extrabold text-xs text-foreground">
            {questionBuilderText.propertiesSidebar.excellent}
          </div>
          <div className="text-[10px] text-muted-foreground font-medium leading-snug">
            {questionBuilderText.propertiesSidebar.qualityDesc}
          </div>
        </div>
      </div>

      <div className="space-y-1 text-[11px] font-semibold text-emerald-600 pt-1">
        {questionBuilderText.qualityChecklist.map((item) => (
          <div key={item}>{item}</div>
        ))}
      </div>

      <button className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 hover:underline cursor-pointer pt-1">
        <span>{questionBuilderText.propertiesSidebar.viewQualityGuide}</span>
        <ExternalLink className="w-3 h-3" />
      </button>
    </Card>
  );
}
