import React from "react";
import StatusVocabulariesContainer from "../../container/StatusVocabularySetContainer";

export interface ListVocabularySetDefinitionProps {
  vocabularySetId: string;
}

const ListVocabularySetDefinition: React.FC<ListVocabularySetDefinitionProps> = ({
  vocabularySetId,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* header  */}
      <StatusVocabulariesContainer vocabularySetId={vocabularySetId} />
    </div>
  );
};

export default ListVocabularySetDefinition;
