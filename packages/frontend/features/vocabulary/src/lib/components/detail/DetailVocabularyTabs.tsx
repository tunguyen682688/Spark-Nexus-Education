import { useState } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@spark-nest-ed/frontend-shared-components';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@spark-nest-ed/frontend-shared-components';
import { Separator } from '@spark-nest-ed/frontend-shared-components';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { DETAIL_VOCABULARY_TEXT } from '../../constants';
import type { Word } from '../../types';

export interface DetailVocabularyTabsProps {
  word: Word;
  onSaveNotes?: (notes: string) => void;
}

export default function DetailVocabularyTabs({
  word,
  onSaveNotes,
}: DetailVocabularyTabsProps) {
  const [notes, setNotes] = useState(word.notes || '');

  // Get etymology from first sense that has etymologyText
  const etymology = word.senses?.find((sense) => sense.etymologyText)?.etymologyText || null;

  // Get related words from lexical variants
  const relatedWords: Array<{ word: string; partOfSpeech: string | null; meaning: string }> = [];
  
  word.lexicalVariants?.forEach((variant) => {
    relatedWords.push({
      word: word.word, // Base word
      partOfSpeech: variant.partOfSpeech ?? null,
      meaning: variant.notes || '',
    });
  });

  const handleSaveNotes = () => {
    if (onSaveNotes) {
      onSaveNotes(notes);
    }
  };

  return (
    <Tabs defaultValue="etymology" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="etymology">{DETAIL_VOCABULARY_TEXT.TABS.ETYMOLOGY}</TabsTrigger>
        <TabsTrigger value="related">{DETAIL_VOCABULARY_TEXT.TABS.RELATED}</TabsTrigger>
        <TabsTrigger value="notes">{DETAIL_VOCABULARY_TEXT.TABS.NOTES}</TabsTrigger>
      </TabsList>

      <TabsContent value="etymology" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>{DETAIL_VOCABULARY_TEXT.ETYMOLOGY.TITLE}</CardTitle>
            <CardDescription>{DETAIL_VOCABULARY_TEXT.ETYMOLOGY.DESCRIPTION}</CardDescription>
          </CardHeader>
          <CardContent>
            {etymology ? (
              <p>{etymology}</p>
            ) : (
              <p className="text-muted-foreground">No etymology information available.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="related" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>{DETAIL_VOCABULARY_TEXT.RELATED_WORDS.TITLE}</CardTitle>
            <CardDescription>{DETAIL_VOCABULARY_TEXT.RELATED_WORDS.DESCRIPTION}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {relatedWords.length > 0 ? (
              relatedWords.map((relatedWord, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center">
                    <span className="font-medium">{relatedWord.word}</span>
                    {relatedWord.partOfSpeech && (
                      <span className="text-sm text-muted-foreground ml-2">
                        ({relatedWord.partOfSpeech})
                      </span>
                    )}
                  </div>
                  {relatedWord.meaning && <p className="text-sm">{relatedWord.meaning}</p>}
                  {index < relatedWords.length - 1 && <Separator className="my-2" />}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No related words available.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notes" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>{DETAIL_VOCABULARY_TEXT.NOTES.TITLE}</CardTitle>
            <CardDescription>{DETAIL_VOCABULARY_TEXT.NOTES.DESCRIPTION}</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full min-h-[150px] p-3 rounded-md border border-border bg-background"
              placeholder={DETAIL_VOCABULARY_TEXT.NOTES.PLACEHOLDER}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button className="ml-auto" onClick={handleSaveNotes}>
              {DETAIL_VOCABULARY_TEXT.NOTES.SAVE_BUTTON}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

