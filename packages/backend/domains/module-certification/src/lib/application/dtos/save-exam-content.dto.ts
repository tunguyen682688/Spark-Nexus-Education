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
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SaveExamContentQuestionOptionDto {
  @ApiPropertyOptional({ description: 'Option identifier (omit for new)' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Option label', example: 'A' })
  @IsString()
  label!: string;

  @ApiProperty({ description: 'Option answer text' })
  @IsString()
  text!: string;

  @ApiProperty({ description: 'Whether this option is the correct answer' })
  @IsBoolean()
  isCorrect!: boolean;
}

export class SaveExamContentQuestionDto {
  @ApiPropertyOptional({ description: 'Question ID (omit for new questions)' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Question type', example: 'mc' })
  @IsString()
  @IsNotEmpty()
  questionType!: string;

  @ApiProperty({ description: 'Question text' })
  @IsString()
  @IsNotEmpty()
  questionText!: string;

  @ApiProperty({ description: 'Difficulty', enum: ['Easy', 'Medium', 'Hard'] })
  @IsString()
  @IsIn(['Easy', 'Medium', 'Hard'])
  difficulty!: string;

  @ApiProperty({ description: 'Answer options', type: [SaveExamContentQuestionOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveExamContentQuestionOptionDto)
  options!: SaveExamContentQuestionOptionDto[];

  @ApiPropertyOptional({ description: 'Model answer for writing/speaking' })
  @IsOptional()
  @IsString()
  modelAnswer?: string;

  @ApiPropertyOptional({ description: 'Rubric (JSON string)' })
  @IsOptional()
  @IsString()
  rubric?: string;

  @ApiPropertyOptional({ description: 'Explanation' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({ description: 'Points', example: 1 })
  @IsNumber()
  @Min(0)
  points!: number;

  @ApiPropertyOptional({ description: 'Estimated time in seconds' })
  @IsOptional()
  @IsNumber()
  estimatedTime?: number;

  @ApiPropertyOptional({ description: 'Audio URL override' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Image URL override' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Passage group ID' })
  @IsOptional()
  @IsString()
  passageGroupId?: string;

  @ApiPropertyOptional({ description: 'Passage text (for grouped questions in Part 6/7)' })
  @IsOptional()
  @IsString()
  passageText?: string;

  @ApiPropertyOptional({ description: 'Passage type (single, double, triple for Part 7)' })
  @IsOptional()
  @IsString()
  passageType?: string;

  @ApiPropertyOptional({ description: 'Passage title (for Part 7 double/triple passages)' })
  @IsOptional()
  @IsString()
  passageTitle?: string;

  @ApiPropertyOptional({ description: 'Blank number' })
  @IsOptional()
  @IsNumber()
  blankNumber?: number;

  @ApiPropertyOptional({ description: 'Sub-question number' })
  @IsOptional()
  @IsNumber()
  subQuestionNumber?: number;
}

export class SaveExamContentSectionDto {
  @ApiPropertyOptional({ description: 'Section ID (omit for new)' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Section title', example: 'Listening Section 1' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Section subtitle' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({ description: 'Section type', enum: ['listening', 'reading', 'writing', 'speaking', 'break'] })
  @IsString()
  @IsIn(['listening', 'reading', 'writing', 'speaking', 'break'])
  sectionType!: string;

  @ApiPropertyOptional({ description: 'Instruction text' })
  @IsOptional()
  @IsString()
  instruction?: string;

  @ApiProperty({ description: 'Order index', example: 1 })
  @IsNumber()
  order!: number;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Whether this is a break' })
  @IsOptional()
  @IsBoolean()
  isBreak?: boolean;

  @ApiPropertyOptional({ description: 'Audio URL (listening sections)' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Script text (listening sections)' })
  @IsOptional()
  @IsString()
  scriptText?: string;

  @ApiPropertyOptional({ description: 'Passage text (reading sections)' })
  @IsOptional()
  @IsString()
  passageText?: string;

  @ApiPropertyOptional({ description: 'Passage title' })
  @IsOptional()
  @IsString()
  passageTitle?: string;

  @ApiPropertyOptional({ description: 'Passage type' })
  @IsOptional()
  @IsString()
  passageType?: string;

  @ApiProperty({ description: 'Questions in this section', type: [SaveExamContentQuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveExamContentQuestionDto)
  questions!: SaveExamContentQuestionDto[];
}

export class SaveExamContentDto {
  @ApiPropertyOptional({ description: 'Exam title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Exam description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Exam level' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;

  @ApiProperty({ description: 'Sections', type: [SaveExamContentSectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveExamContentSectionDto)
  sections!: SaveExamContentSectionDto[];
}
