import { PropertiesSidebar } from './PropertiesSidebar';
import { QualityCard } from './QualityCard';
import { UsedInCard } from './UsedInCard';
import type { QuestionPropertiesForm } from '../../../types/question-builder.types';

interface QuestionPropertiesPanelProps {
  properties: QuestionPropertiesForm;
  setProperties: (value: QuestionPropertiesForm | ((prev: QuestionPropertiesForm) => QuestionPropertiesForm)) => void;
  handleRemoveTag: (tag: string) => void;
  handleRemoveSkill: (skill: string) => void;
  qualityScore: number;
  examTitle: string;
  sectionLabel: string;
}

export const QuestionPropertiesPanel = ({
  properties,
  setProperties,
  handleRemoveTag,
  handleRemoveSkill,
  qualityScore,
  examTitle,
  sectionLabel,
}: QuestionPropertiesPanelProps) => {
  return (
    <>
      <PropertiesSidebar
        properties={properties}
        onPropertiesChange={setProperties}
        onRemoveTag={handleRemoveTag}
        onRemoveSkill={handleRemoveSkill}
      />
      <QualityCard qualityScore={qualityScore} />
      <UsedInCard examTitle={examTitle} sectionLabel={sectionLabel} />
    </>
  );
};
