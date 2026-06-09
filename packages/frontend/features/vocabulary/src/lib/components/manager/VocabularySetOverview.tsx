import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  Button,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Skeleton,
} from "@spark-nest-ed/frontend-shared-components";
import { Volume2 } from "lucide-react";

export interface VocabularySetOverviewProps {
  vocabularySet?: {
    description?: string | null;
  };
  filteredItems: Array<{
    id: string;
    displayWord: {
      word: string;
      pronunciation?: string | null;
      partOfSpeech?: string | null;
      definition: string;
      example?: string | null;
    };
    customDefinition?: string | null;
    customExample?: string | null;
    notes?: string | null;
  }>;
  isLoading: boolean;
  onViewAllWords: () => void;
}

const VocabularySetOverview: React.FC<VocabularySetOverviewProps> = ({
  vocabularySet,
  filteredItems,
  isLoading,
  onViewAllWords,
}) => {
  return (
    <div className="md:col-span-2 space-y-6">
      {/* Main content card */}
      <Card>
        <CardHeader>
          <CardTitle>About This Vocabulary List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {vocabularySet?.description ? (
            <div className="prose dark:prose-invert">
              <p>{vocabularySet.description}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No description available for this vocabulary set.
            </p>
          )}

          <div className="pt-4">
            <h4 className="font-medium mb-2">Recommended Study Plan</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Spend 15-20 minutes daily reviewing new words</li>
              <li>Practice with flashcards for better memorization</li>
              <li>
                Use each new word in a sentence to reinforce learning
              </li>
              <li>
                Review previously learned words weekly to prevent forgetting
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Sample words preview */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Words</CardTitle>
          <CardDescription>
            Preview some words from this vocabulary list
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredItems.slice(0, 5).map((item) => {
                const word = item.displayWord;
                return (
                  <AccordionItem
                    key={item.id}
                    value={`vocabulary-${item.id}`}
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex justify-between w-full pr-4">
                        <div className="font-medium">{word.word}</div>
                        {(word.partOfSpeech || item.notes) && (
                          <div className="text-sm text-muted-foreground">
                            {word.partOfSpeech || item.notes}
                          </div>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {word.pronunciation && (
                          <div className="flex items-center">
                            <div className="text-sm font-medium w-24">
                              Pronunciation:
                            </div>
                            <div className="text-sm flex items-center">
                              {word.pronunciation}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 h-6 w-6 p-0"
                                onClick={() => {
                                  // TODO: Implement text-to-speech
                                }}
                              >
                                <Volume2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="flex">
                          <div className="text-sm font-medium w-24">
                            Meaning:
                          </div>
                          <div className="text-sm">
                            {item.customDefinition || word.definition}
                          </div>
                        </div>
                        {(item.customExample || word.example) && (
                          <div className="flex">
                            <div className="text-sm font-medium w-24">
                              Example:
                            </div>
                            <div className="text-sm italic">
                              {item.customExample || word.example}
                            </div>
                          </div>
                        )}
                        {item.notes && (
                          <div className="flex">
                            <div className="text-sm font-medium w-24">
                              Notes:
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No words available in this vocabulary set.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={onViewAllWords}>
            View All Words
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VocabularySetOverview;

