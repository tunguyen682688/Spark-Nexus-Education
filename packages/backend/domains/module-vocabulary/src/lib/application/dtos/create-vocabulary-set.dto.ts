import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DifficultyLevel } from '../../domain/value-objects/difficulty.vo';
import { Language } from '../../domain/value-objects/language.vo';
import { SetType } from '../../domain/value-objects/set-type.vo';

export class InitialVocabularyWordDto {
  @ApiProperty({
    description: 'The vocabulary word',
    example: 'hello',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Word is required' })
  @MaxLength(255, { message: 'Word cannot exceed 255 characters' })
  word!: string;

  @ApiPropertyOptional({
    description: 'Definition of the word',
    example: 'A greeting used when meeting someone',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Definition cannot exceed 1000 characters' })
  definition?: string;

  @ApiPropertyOptional({
    description: 'Example sentence using the word',
    example: 'Hello, how are you?',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Example cannot exceed 1000 characters' })
  example?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the word',
    example: 'Common greeting in English',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Notes cannot exceed 1000 characters' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Part of speech (grammatical category)',
    example: 'noun',
    enum: ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection'],
  })
  @IsString()
  @IsOptional()
  @IsEnum(['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection'], {
    message: 'Part of speech must be one of: noun, verb, adjective, adverb, preposition, conjunction, pronoun, interjection',
  })
  partOfSpeech?: string;
}

/**
 * DTO for creating a new vocabulary set
 * Maps to UC-VOC-001: Create Vocabulary Package
 */
export class CreateVocabularySetDto {
  @ApiProperty({
    description: 'Title of the vocabulary set',
    example: 'IELTS Writing Vocabulary',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(1, { message: 'Title must not be empty' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title!: string;

  @ApiPropertyOptional({
    description: 'Description of the vocabulary set',
    example: 'Essential vocabulary words for IELTS writing task 2',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @ApiProperty({
    description: 'Language of the vocabulary set',
    enum: Language,
    example: Language.ENGLISH,
  })
  @IsEnum(Language, {
    message: `Language must be one of: ${Object.values(Language).join(', ')}`,
  })
  language!: Language;

  @ApiProperty({
    description: 'Type of vocabulary set',
    enum: SetType,
    example: SetType.CUSTOM,
  })
  @IsEnum(SetType, {
    message: `Type must be one of: ${Object.values(SetType).join(', ')}`,
  })
  type!: SetType;

  @ApiPropertyOptional({
    description: 'Difficulty level of the vocabulary set',
    enum: DifficultyLevel,
    example: DifficultyLevel.INTERMEDIATE,
  })
  @IsEnum(DifficultyLevel, {
    message: `Difficulty must be one of: ${Object.values(DifficultyLevel).join(
      ', '
    )}`,
  })
  @IsOptional()
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({
    description: 'Tags for categorizing the vocabulary set',
    type: [String],
    example: ['ielts', 'writing', 'academic'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'URL of the cover image for the vocabulary set',
    example: 'https://example.com/images/ielts-cover.jpg',
  })
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Array of existing entry IDs to add to the vocabulary set',
    type: [String],
    example: ['entry-id-1', 'entry-id-2'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  initialEntryIds?: string[];

  @ApiPropertyOptional({
    description:
      'Array of new words to add to the vocabulary set. If word does not exist, it will be created as draft and needs approval.',
    type: [InitialVocabularyWordDto],
    example: [
      {
        word: 'hello',
        definition: 'A greeting',
        example: 'Hello, how are you?',
        notes: 'Common greeting',
      },
      {
        word: 'world',
        definition: 'The earth and all its inhabitants',
        example: 'Hello, world!',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitialVocabularyWordDto)
  @IsOptional()
  initialWords?: InitialVocabularyWordDto[];
}
