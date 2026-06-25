import { IsString, IsNumber, IsOptional, IsArray, IsIn, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExamQuestionDto {
  @ApiProperty({
    description: 'Unique identifier of the exam question',
    example: 'question-uuid-1234',
  })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({
    description: 'The text/prompt of the question',
    example: 'Choose the correct form of the verb: She ______ (go) to school everyday.',
  })
  @IsString()
  @IsNotEmpty()
  text!: string;

  @ApiProperty({
    description: 'Type of question format',
    enum: ['MULTIPLE_CHOICE', 'SENTENCE_BUILDER', 'ERROR_SPOTLIGHT'],
    example: 'MULTIPLE_CHOICE',
  })
  @IsString()
  @IsIn(['MULTIPLE_CHOICE', 'SENTENCE_BUILDER', 'ERROR_SPOTLIGHT'])
  type!: 'MULTIPLE_CHOICE' | 'SENTENCE_BUILDER' | 'ERROR_SPOTLIGHT';

  @ApiPropertyOptional({
    description: 'Options list for MULTIPLE_CHOICE question type',
    type: [String],
    example: ['go', 'goes', 'went', 'has gone'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiProperty({
    description: 'The correct answer for the question',
    example: 'goes',
  })
  @IsString()
  @IsNotEmpty()
  answer!: string;

  @ApiProperty({
    description: 'Explanation for why this is the correct answer',
    example: "With singular subjects like 'She' and frequency adverbs like 'everyday', we use the Present Simple tense ('goes').",
  })
  @IsString()
  @IsNotEmpty()
  explanation!: string;

  @ApiProperty({
    description: 'Grammar category for targeted skill analytics',
    enum: ['syntax', 'tenses', 'morphology', 'modality'],
    example: 'tenses',
  })
  @IsString()
  @IsIn(['syntax', 'tenses', 'morphology', 'modality'])
  category!: 'syntax' | 'tenses' | 'morphology' | 'modality';

  @ApiPropertyOptional({
    description: 'Scrambled words for SENTENCE_BUILDER question type',
    type: [String],
    example: ['she', 'school', 'goes', 'to', 'everyday'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  words?: string[];

  @ApiPropertyOptional({
    description: 'The complete correct sentence structure (used for sentence builder / error spotlight)',
    example: 'She goes to school everyday.',
  })
  @IsOptional()
  @IsString()
  sentence?: string;

  @ApiPropertyOptional({
    description: 'The incorrect word in the sentence for ERROR_SPOTLIGHT type',
    example: 'go',
  })
  @IsOptional()
  @IsString()
  incorrectWord?: string;

  @ApiPropertyOptional({
    description: 'The correct replacement for incorrectWord in ERROR_SPOTLIGHT type',
    example: 'goes',
  })
  @IsOptional()
  @IsString()
  correctWord?: string;
}

export class CreateExamSetDto {
  @ApiProperty({
    description: 'Title of the exam set',
    example: 'Intermediate CEFR B1 Grammar Assessment',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Description of the exam set contents',
    example: 'Comprehensive grammar assessment test covering B1 level grammar structures.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'Target CEFR proficiency level (or ALL)',
    example: 'B1',
  })
  @IsString()
  @IsNotEmpty()
  level!: string; // A1, A2, B1, B2, C1, C2, hoặc ALL

  @ApiProperty({
    description: 'Type of standard examination pattern',
    example: 'CEFR',
  })
  @IsString()
  @IsNotEmpty()
  examType!: string; // CEFR, TOEIC, IELTS, VSTEP

  @ApiPropertyOptional({
    description: 'JSON object containing extra exam metadata (passing score, section breakdown, etc.)',
    example: { passingPercentage: 70 },
  })
  @IsOptional()
  examMetadata?: Record<string, any>;

  @ApiProperty({
    description: 'Time limit allowed to complete the exam set (in seconds)',
    example: 1800,
  })
  @IsNumber()
  timeLimit!: number; // in seconds

  @ApiProperty({
    description: 'List of grammar questions included in the exam set',
    type: [ExamQuestionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamQuestionDto)
  questions!: ExamQuestionDto[];
}

export class SubmitExamAttemptDto {
  @ApiProperty({
    description: 'Number of correctly answered questions in this attempt',
    example: 18,
  })
  @IsNumber()
  correctCount!: number;

  @ApiProperty({
    description: 'Total number of questions evaluated in this attempt',
    example: 20,
  })
  @IsNumber()
  totalCount!: number;
}


