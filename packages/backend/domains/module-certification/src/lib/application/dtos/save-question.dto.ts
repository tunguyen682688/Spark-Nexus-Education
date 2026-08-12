import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SaveQuestionOptionDto {
  @ApiPropertyOptional({ description: 'Option identifier (omit for new options)', example: 'opt-a' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Option label', example: 'A' })
  @IsString()
  label!: string;

  @ApiProperty({ description: 'Option answer text', example: 'It offers free certification.' })
  @IsString()
  text!: string;

  @ApiProperty({ description: 'Whether this option is the correct answer', example: false })
  @IsBoolean()
  isCorrect!: boolean;
}

/**
 * DTO for saving a question to the Question Bank.
 * Question-level content fields (passageId, modelAnswer, etc.) are stored here
 * because they belong to the question itself, not to any specific exam.
 */
export class SaveQuestionDto {
  @ApiPropertyOptional({ description: 'Question identifier (omit to create a new question)', example: 'Q-000012' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Question text', example: 'According to the advertisement, what is the main benefit?' })
  @IsString()
  @IsNotEmpty()
  questionText!: string;

  @ApiProperty({ description: 'Question type', example: 'Multiple Choice (Single Answer)' })
  @IsString()
  questionType!: string;

  @ApiProperty({ description: 'Difficulty level', example: 'Medium' })
  @IsString()
  difficulty!: string;

  @ApiPropertyOptional({ description: 'Question category (reading, listening, grammar, vocabulary, writing, speaking)', example: 'reading' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Whether options should be shuffled', example: false })
  @IsOptional()
  @IsBoolean()
  shuffleOptions?: boolean;

  @ApiProperty({ description: 'Answer options', type: [SaveQuestionOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveQuestionOptionDto)
  options!: SaveQuestionOptionDto[];

  @ApiPropertyOptional({ description: 'Explanation shown to learners' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ description: 'Default points for this question in the bank (overridden per exam)', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({ description: 'Estimated time to answer (mm:ss)', example: '00:45' })
  @IsOptional()
  @IsString()
  estimatedTime?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Skills / objectives', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ description: 'Cognitive level (Bloom taxonomy)', example: 'Understand' })
  @IsOptional()
  @IsString()
  cognitiveLevel?: string;

  @ApiPropertyOptional({ description: 'Save target: exam question or reusable bank item', example: 'exam' })
  @IsOptional()
  @IsString()
  target?: 'exam' | 'bank';

  // Reference fields (bank metadata)
  @ApiPropertyOptional({ description: 'Reference type (Passage, Image, External Link)' })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({ description: 'Passage or source reference' })
  @IsOptional()
  @IsString()
  passageSource?: string;

  @ApiPropertyOptional({ description: 'Highlight text for learners' })
  @IsOptional()
  @IsString()
  highlight?: string;

  // ── Question content fields (stored in QuestionMetadata) ──

  @ApiPropertyOptional({ description: 'Passage ID for reading/listening questions' })
  @IsOptional()
  @IsString()
  passageId?: string;

  @ApiPropertyOptional({ description: 'Passage text (question-level, shared across exams)' })
  @IsOptional()
  @IsString()
  passageText?: string;

  @ApiPropertyOptional({ description: 'Model answer for speaking/writing' })
  @IsOptional()
  @IsString()
  modelAnswer?: string;

  @ApiPropertyOptional({ description: 'Rubric for scoring (JSON)' })
  @IsOptional()
  rubric?: unknown;

  @ApiPropertyOptional({ description: 'Matching pairs for matching questions' })
  @IsOptional()
  @IsArray()
  matchingPairs?: Array<{ left: string; right: string }>;

  @ApiPropertyOptional({ description: 'Root word for Cambridge word formation' })
  @IsOptional()
  @IsString()
  wordRoot?: string;

  @ApiPropertyOptional({ description: 'Key word for Cambridge key word transformation' })
  @IsOptional()
  @IsString()
  keyWord?: string;
}
