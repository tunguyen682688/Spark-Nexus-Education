import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@spark-nest-ed/frontend-shared-components";
import { Play, Plus } from "lucide-react";
import { DETAIL_SET_TEXT } from "../../constants";

export interface VocabularySetStudyOptionsProps {
  onPracticeAll?: () => void;
  onPracticeDifficult?: () => void;
  onSpacedRepetition?: () => void;
  onCreateFlashcards?: () => void;
}

const VocabularySetStudyOptions: React.FC<
  VocabularySetStudyOptionsProps
> = ({
  onPracticeAll,
  onPracticeDifficult,
  onSpacedRepetition,
  onCreateFlashcards,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{DETAIL_SET_TEXT.STUDY_OPTIONS.TITLE}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button className="w-full justify-start" onClick={onPracticeAll}>
          <Play className="h-4 w-4 mr-2" />{" "}
          {DETAIL_SET_TEXT.STUDY_OPTIONS.PRACTICE_ALL}
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onPracticeDifficult}
        >
          <Play className="h-4 w-4 mr-2" />{" "}
          {DETAIL_SET_TEXT.STUDY_OPTIONS.PRACTICE_DIFFICULT}
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onSpacedRepetition}
        >
          <Play className="h-4 w-4 mr-2" />{" "}
          {DETAIL_SET_TEXT.STUDY_OPTIONS.SPACED_REPETITION}
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onCreateFlashcards}
        >
          <Plus className="h-4 w-4 mr-2" />{" "}
          {DETAIL_SET_TEXT.STUDY_OPTIONS.CREATE_FLASHCARDS}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VocabularySetStudyOptions;

