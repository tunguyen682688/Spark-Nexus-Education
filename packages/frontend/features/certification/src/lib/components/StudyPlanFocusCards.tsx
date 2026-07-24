import React from 'react';
import { Card, CardContent } from '@spark-nest-ed/frontend-shared-components';
import { StudyPlanFocusCard } from '../hooks/useStudyPlanContainerLogic';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

interface StudyPlanFocusCardsProps {
  cards: StudyPlanFocusCard[];
}

export const StudyPlanFocusCards: React.FC<StudyPlanFocusCardsProps> = ({
  cards,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={`p-2 rounded-lg ${card.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-foreground">
                  {card.title}
                </h4>
                <p className="text-[10px] text-muted-foreground">{card.desc}</p>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-indigo-600">
                <span>{CERTIFICATION_UI_TEXT.studyPlan.progressLabel}</span>
                <span>{card.val}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
