import { IsString, IsNotEmpty, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VocabularySetItemDto } from './reponse-word.dto';

/**
 * DTO for reviewing a flashcard
 * Maps to UC-VOC-8: Learn with Flashcard (SRS Review)
 */
export class ReviewFlashcardDto {
  @ApiProperty({
    description: 'The vocabulary set item ID to review',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty({ message: 'Item ID is required' })
  itemId!: string;

  @ApiProperty({
    description: 'The review quality/difficulty rating (0-5) where 1=Again (Lại), 2=Hard (Khó), 4=Good (Tốt), 5=Easy (Dễ)',
    example: 4,
    minimum: 0,
    maximum: 5,
  })
  @IsInt({ message: 'Quality must be an integer' })
  @Min(0, { message: 'Quality cannot be less than 0' })
  @Max(5, { message: 'Quality cannot be greater than 5' })
  quality!: number;
}

/**
 * Response DTO for User Vocabulary Progress (SRS status)
 */
export class UserVocabularyProgressResponseDto {
  @ApiProperty({ example: 'progress-id-123' })
  id!: string;

  @ApiProperty({ example: 'user-id-123' })
  userId!: string;

  @ApiProperty({ example: 'item-id-123' })
  itemId!: string;

  @ApiProperty({ example: 'LEARNING', enum: ['NEW', 'LEARNING', 'MASTERED'] })
  status!: string;

  @ApiProperty({ example: 4, description: 'Consecutive successful study sessions' })
  streak!: number;

  @ApiProperty({ example: 0.8, description: 'Mastery progress percentage (0 to 1)' })
  masteryLevel!: number;

  @ApiProperty({ example: '2026-05-24T15:27:40Z', nullable: true })
  lastReview!: Date | null;

  @ApiProperty({ example: '2026-05-28T15:27:40Z', nullable: true })
  nextReviewAt!: Date | null;

  @ApiProperty({ example: 4, description: 'Days until next review interval' })
  interval!: number;

  @ApiProperty({ example: 2.6, description: 'SuperMemo-2 Ease Factor parameter' })
  easeFactor!: number;

  @ApiProperty({ example: 3, description: 'Total successful reviews' })
  repetitions!: number;
}

/**
 * Individual word DTO within the flashcard session
 */
export class FlashcardSessionWordDto {
  @ApiProperty({ type: () => VocabularySetItemDto })
  item!: VocabularySetItemDto;

  @ApiPropertyOptional({ type: () => UserVocabularyProgressResponseDto, nullable: true })
  progress!: UserVocabularyProgressResponseDto | null;
}

/**
 * Response DTO for initializing a flashcard study session
 */
export class FlashcardSessionResponseDto {
  @ApiProperty({ example: 'set-id-123' })
  id!: string;

  @ApiProperty({ example: 'set-id-123' })
  setId!: string;

  @ApiProperty({ example: 'My Vocabulary Set' })
  title!: string;

  @ApiPropertyOptional({ example: 'A collection of vocabulary words' })
  description?: string;

  @ApiProperty({ example: 14, description: 'Total current study streak of the user' })
  streak!: number;

  @ApiProperty({ type: [FlashcardSessionWordDto] })
  words!: FlashcardSessionWordDto[];
}
