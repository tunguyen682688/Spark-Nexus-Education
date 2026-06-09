import { Card, CardContent, CardHeader, CardTitle } from '@spark-nest-ed/frontend-shared-components';
import { DETAIL_VOCABULARY_TEXT } from '../../constants';
import type { Word } from '../../types';

export interface DetailVocabularySynonymsAntonymsCardProps {
  word: Word;
}

export default function DetailVocabularySynonymsAntonymsCard({
  word,
}: DetailVocabularySynonymsAntonymsCardProps) {
  // Collect synonyms and antonyms from senses
  const synonyms: string[] = [];
  const antonyms: string[] = [];

  // Add from word level
  if (word.synonyms) {
    synonyms.push(...word.synonyms);
  }
  if (word.antonyms) {
    antonyms.push(...word.antonyms);
  }

  // Add from senses
  word.senses?.forEach((sense) => {
    if (sense.synonym) {
      synonyms.push(sense.synonym);
    }
    if (sense.antonym) {
      antonyms.push(sense.antonym);
    }
  });

  // Remove duplicates
  const uniqueSynonyms = Array.from(new Set(synonyms));
  const uniqueAntonyms = Array.from(new Set(antonyms));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{DETAIL_VOCABULARY_TEXT.SIDEBAR.SYNONYMS_ANTONYMS_TITLE}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {uniqueSynonyms.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">{DETAIL_VOCABULARY_TEXT.SIDEBAR.SYNONYMS_TITLE}</h4>
            <div className="flex flex-wrap gap-2">
              {uniqueSynonyms.map((synonym) => (
                <div
                  key={synonym}
                  className="px-3 py-1 rounded-md bg-muted text-sm"
                >
                  {synonym}
                </div>
              ))}
            </div>
          </div>
        )}

        {uniqueAntonyms.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">{DETAIL_VOCABULARY_TEXT.SIDEBAR.ANTONYMS_TITLE}</h4>
            <div className="flex flex-wrap gap-2">
              {uniqueAntonyms.map((antonym) => (
                <div
                  key={antonym}
                  className="px-3 py-1 rounded-md bg-muted text-sm"
                >
                  {antonym}
                </div>
              ))}
            </div>
          </div>
        )}

        {uniqueSynonyms.length === 0 && uniqueAntonyms.length === 0 && (
          <p className="text-muted-foreground text-sm">No synonyms or antonyms available.</p>
        )}
      </CardContent>
    </Card>
  );
}

