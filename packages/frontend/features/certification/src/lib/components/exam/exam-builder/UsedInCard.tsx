import { Card } from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';

interface UsedInCardProps {
  examTitle?: string;
  sectionLabel?: string;
}

export function UsedInCard({ examTitle = '', sectionLabel = '' }: UsedInCardProps) {
  const questionBuilderText = CERTIFICATION_UI_TEXT.questionBuilder;

  return (
    <Card className="border-border shadow-sm bg-card p-4 space-y-1 text-xs">
      <h4 className="font-extrabold text-xs uppercase tracking-wider text-foreground pb-1 border-b border-border">
        {questionBuilderText.propertiesSidebar.usedInTitle}
      </h4>
      <div className="font-bold text-foreground pt-1">
        {examTitle || '—'}
      </div>
      {sectionLabel && (
        <div className="text-[10px] text-muted-foreground font-medium">
          {sectionLabel}
        </div>
      )}
    </Card>
  );
}
