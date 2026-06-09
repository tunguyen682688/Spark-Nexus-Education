import { Card, CardContent, CardHeader, CardTitle } from '@spark-nest-ed/frontend-shared-components';
import { DETAIL_VOCABULARY_TEXT } from '../../constants';
import type { Word } from '../../types';

export interface DetailVocabularyDefinitionCardProps {
  word: Word;
}

export default function DetailVocabularyDefinitionCard({
  word,
}: DetailVocabularyDefinitionCardProps) {
  // Get primary definition from first sense or fallback to word.definition
  const primaryDefinition = word.senses?.[0]?.definition || word.definition;
  
  // Get all examples from senses and word examples
  const allExamples: string[] = [];
  
  // Add examples from senses
  word.senses?.forEach((sense) => {
    if (sense.usage) {
      allExamples.push(sense.usage);
    }
  });
  
  // Add examples from word.examples array
  word.examples?.forEach((ex) => {
    if (ex.exampleText) {
      allExamples.push(ex.exampleText);
    }
  });
  
  // Add single example if exists
  if (word.example) {
    allExamples.push(word.example);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{DETAIL_VOCABULARY_TEXT.DEFINITION.TITLE}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg">{primaryDefinition}</p>
        </div>

        {allExamples.length > 0 && (
          <div className="pt-2">
            <h4 className="font-medium mb-2">{DETAIL_VOCABULARY_TEXT.DEFINITION.EXAMPLES_TITLE}</h4>
            <ul className="list-disc pl-5 space-y-1">
              {allExamples.map((example, index) => (
                <li key={index}>{example}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

