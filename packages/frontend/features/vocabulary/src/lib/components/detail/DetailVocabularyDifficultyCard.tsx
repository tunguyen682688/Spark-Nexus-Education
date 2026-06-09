import { Card, CardContent, CardHeader, CardTitle } from '@spark-nest-ed/frontend-shared-components';
import { Star } from 'lucide-react';
import { DETAIL_VOCABULARY_TEXT } from '../../constants';
import type { Word } from '../../types';

export interface DetailVocabularyDifficultyCardProps {
  word: Word;
}

export default function DetailVocabularyDifficultyCard({
  word,
}: DetailVocabularyDifficultyCardProps) {
  // Determine difficulty from sense level or frequency
  const getDifficulty = (): 'easy' | 'medium' | 'hard' => {
    const level = word.senses?.[0]?.level;
    if (level === 'beginner' || level === 'elementary') return 'easy';
    if (level === 'advanced' || level === 'proficient') return 'hard';
    return 'medium';
  };

  const difficulty = getDifficulty();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{DETAIL_VOCABULARY_TEXT.SIDEBAR.DIFFICULTY_TITLE}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-2">
          {difficulty === 'easy' && (
            <div className="flex">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <Star className="h-6 w-6 text-muted" />
              <Star className="h-6 w-6 text-muted" />
            </div>
          )}
          {difficulty === 'medium' && (
            <div className="flex">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <Star className="h-6 w-6 text-muted" />
            </div>
          )}
          {difficulty === 'hard' && (
            <div className="flex">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            </div>
          )}
        </div>
        <div className="text-center text-sm text-muted-foreground mt-1">
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} {DETAIL_VOCABULARY_TEXT.DIFFICULTY.SUFFIX}
        </div>
      </CardContent>
    </Card>
  );
}

