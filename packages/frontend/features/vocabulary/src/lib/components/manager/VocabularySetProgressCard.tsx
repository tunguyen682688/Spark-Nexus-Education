import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
} from "@spark-nest-ed/frontend-shared-components";
import { DETAIL_SET_TEXT } from "../../constants";

export interface VocabularySetProgressCardProps {
  progress: number;
  masteredCount: number;
  learningCount: number;
  notStartedCount: number;
}

const VocabularySetProgressCard: React.FC<
  VocabularySetProgressCardProps
> = ({ progress, masteredCount, learningCount, notStartedCount }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{DETAIL_SET_TEXT.PROGRESS_CARD.TITLE}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center mb-4">
          <div className="text-3xl font-bold">{progress}%</div>
          <div className="text-sm text-muted-foreground">
            {DETAIL_SET_TEXT.PROGRESS_CARD.COMPLETED_LABEL}
          </div>
        </div>
        <Progress value={progress} className="h-2" />

        <div className="grid grid-cols-3 gap-2 pt-4 text-center">
          <div className="space-y-1">
            <div className="text-sm font-medium">{masteredCount}</div>
            <div className="text-xs text-muted-foreground">
              {DETAIL_SET_TEXT.PROGRESS_CARD.MASTERED_LABEL}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">{learningCount}</div>
            <div className="text-xs text-muted-foreground">
              {DETAIL_SET_TEXT.PROGRESS_CARD.LEARNING_LABEL}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">{notStartedCount}</div>
            <div className="text-xs text-muted-foreground">
              {DETAIL_SET_TEXT.PROGRESS_CARD.NOT_STARTED_LABEL}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VocabularySetProgressCard;

