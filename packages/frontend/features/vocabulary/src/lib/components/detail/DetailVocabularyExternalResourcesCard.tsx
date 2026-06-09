import { Card, CardContent, CardHeader, CardTitle } from '@spark-nest-ed/frontend-shared-components';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { ExternalLink } from 'lucide-react';
import { DETAIL_VOCABULARY_TEXT, EXTERNAL_DICTIONARY_URLS } from '../../constants';
import type { Word } from '../../types';

export interface DetailVocabularyExternalResourcesCardProps {
  word: Word;
}

export default function DetailVocabularyExternalResourcesCard({
  word,
}: DetailVocabularyExternalResourcesCardProps) {
  const wordLower = word.word.toLowerCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{DETAIL_VOCABULARY_TEXT.SIDEBAR.EXTERNAL_RESOURCES_TITLE}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          asChild
        >
          <a
            href={EXTERNAL_DICTIONARY_URLS.MERRIAM_WEBSTER(wordLower)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4 mr-2" /> {DETAIL_VOCABULARY_TEXT.EXTERNAL_RESOURCES.MERRIAM_WEBSTER}
          </a>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          asChild
        >
          <a
            href={EXTERNAL_DICTIONARY_URLS.CAMBRIDGE(wordLower)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4 mr-2" /> {DETAIL_VOCABULARY_TEXT.EXTERNAL_RESOURCES.CAMBRIDGE}
          </a>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          asChild
        >
          <a
            href={EXTERNAL_DICTIONARY_URLS.THESAURUS(wordLower)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4 mr-2" /> {DETAIL_VOCABULARY_TEXT.EXTERNAL_RESOURCES.THESAURUS}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

