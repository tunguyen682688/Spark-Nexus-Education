import {
  PropertiesSidebar,
  QualityCard,
  UsedInCard,
} from '../../components/exam/exam-builder';

interface QuestionPropertiesPanelProps {
  properties: {
    tags: string[];
    skills: string[];
    cognitiveLevel: string;
  };
  setProperties: (p: { tags: string[]; skills: string[]; cognitiveLevel: string }) => void;
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
