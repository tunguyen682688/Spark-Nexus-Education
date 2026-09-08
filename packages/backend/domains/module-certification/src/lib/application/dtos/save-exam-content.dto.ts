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
import { Type, Transform } from 'class-transformer';

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
  @Transform(({ value }) => value ?? undefined)
  id?: string;

  @ApiProperty({ description: 'Question type', example: 'mc' })
  @IsString()
  @IsNotEmpty()
  questionType!: string;

  @ApiProperty({ description: 'Question text' })
  @IsString()
  questionText!: string;

  @ApiProperty({ description: 'Difficulty', enum: ['Easy', 'Medium', 'Hard'] })
  @IsString()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const normalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    return ['Easy', 'Medium', 'Hard'].includes(normalized) ? normalized : value;
  })
  difficulty!: string;

  @ApiProperty({ description: 'Answer options', type: [SaveExamContentQuestionOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveExamContentQuestionOptionDto)
  options!: SaveExamContentQuestionOptionDto[];

  @ApiPropertyOptional({ description: 'Model answer for writing/speaking' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  modelAnswer?: string;

  @ApiPropertyOptional({ description: 'Rubric (JSON string)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  rubric?: string;

  @ApiPropertyOptional({ description: 'Explanation' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  explanation?: string;

  @ApiProperty({ description: 'Points', example: 1 })
  @IsNumber()
  @Min(0)
  points!: number;

  @ApiPropertyOptional({ description: 'Estimated time in seconds' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ?? undefined)
  estimatedTime?: number;

  @ApiPropertyOptional({ description: 'Audio URL override' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Image URL override' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Passage group ID' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  passageGroupId?: string;

  @ApiPropertyOptional({ description: 'Passage text (for grouped questions in Part 6/7)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  passageText?: string;

  @ApiPropertyOptional({ description: 'Passage type (single, double, triple for Part 7)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  passageType?: string;

  @ApiPropertyOptional({ description: 'Passage title (for Part 7 double/triple passages)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  passageTitle?: string;

  @ApiPropertyOptional({ description: 'Blank number' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ?? undefined)
  blankNumber?: number;

  @ApiPropertyOptional({ description: 'Sub-question number' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ?? undefined)
  subQuestionNumber?: number;

  @ApiPropertyOptional({ description: 'Format metadata (flexible JSON for per-exam extra data)' })
  @IsOptional()
  @Transform(({ value }) => value ?? undefined)
  formatMetadata?: Record<string, unknown>;
}

export class SaveExamContentSectionDto {
  @ApiPropertyOptional({ description: 'Section ID (omit for new)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  id?: string;

  @ApiProperty({ description: 'Section title', example: 'Listening Section 1' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Section subtitle' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  subtitle?: string;

  @ApiProperty({ description: 'Section type', enum: ['listening', 'reading', 'writing', 'speaking', 'break', 'general', 'math'] })
  @IsString()
  @IsIn(['listening', 'reading', 'writing', 'speaking', 'break', 'general', 'math'])
  sectionType!: string;

  @ApiPropertyOptional({ description: 'Instruction text' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  instruction?: string;

  @ApiProperty({ description: 'Order index', example: 1 })
  @IsNumber()
  order!: number;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ?? undefined)
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Whether this is a break' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value ?? undefined)
  isBreak?: boolean;

  @ApiPropertyOptional({ description: 'Audio URL (listening sections)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Script text (listening sections)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  scriptText?: string;

  @ApiPropertyOptional({ description: 'Passage text (reading sections)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  passageText?: string;

  @ApiPropertyOptional({ description: 'Passage title' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  passageTitle?: string;

  @ApiPropertyOptional({ description: 'Passage type' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
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
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ description: 'Passing score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  passScore?: number;

  @ApiPropertyOptional({ description: 'Max score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxScore?: number;

  @ApiPropertyOptional({ description: 'Exam type' })
  @IsOptional()
  @IsString()
  examType?: string;

  @ApiPropertyOptional({ description: 'Certification type' })
  @IsOptional()
  @IsString()
  certificationType?: string;

  @ApiPropertyOptional({ description: 'Publish status' })
  @IsOptional()
  @IsString()
  publishStatus?: string;

  @ApiProperty({ description: 'Sections', type: [SaveExamContentSectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveExamContentSectionDto)
  sections!: SaveExamContentSectionDto[];
}

export class PatchSectionMetadataDto {
  @ApiProperty({ description: 'Section ID' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiPropertyOptional({ description: 'Section title' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  title?: string;

  @ApiPropertyOptional({ description: 'Section subtitle' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  subtitle?: string;

  @ApiPropertyOptional({ description: 'Instruction text' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  instruction?: string;

  @ApiPropertyOptional({ description: 'Order index' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ?? undefined)
  order?: number;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ?? undefined)
  durationMinutes?: number;
}

export class PatchExamSettingsDto {
  @ApiPropertyOptional({ description: 'Exam title' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  title?: string;

  @ApiPropertyOptional({ description: 'Exam description' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  description?: string;

  @ApiPropertyOptional({ description: 'Exam level' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  level?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => value ?? undefined)
  duration?: number;

  @ApiPropertyOptional({ description: 'Passing score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => value ?? undefined)
  passScore?: number;

  @ApiPropertyOptional({ description: 'Max score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => value ?? undefined)
  maxScore?: number;

  @ApiPropertyOptional({ description: 'Exam type' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  examType?: string;

  @ApiPropertyOptional({ description: 'Certification type' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  certificationType?: string;

  @ApiPropertyOptional({ description: 'Publish status' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  publishStatus?: string;
}

export class PatchExamContentSectionDto {
  @ApiProperty({ description: 'Section ID' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ description: 'Questions in this section (only dirty questions)', type: [SaveExamContentQuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveExamContentQuestionDto)
  questions!: SaveExamContentQuestionDto[];
}

export class PatchExamContentDto {
  @ApiPropertyOptional({ description: 'Exam settings (nested)', type: PatchExamSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PatchExamSettingsDto)
  @Transform(({ value }) => value ?? undefined)
  examSettings?: PatchExamSettingsDto;

  // Flat fields for backward compatibility
  @ApiPropertyOptional({ description: 'Exam title' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  title?: string;

  @ApiPropertyOptional({ description: 'Exam description' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  description?: string;

  @ApiPropertyOptional({ description: 'Exam level' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  level?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => value ?? undefined)
  duration?: number;

  @ApiPropertyOptional({ description: 'Passing score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => value ?? undefined)
  passScore?: number;

  @ApiPropertyOptional({ description: 'Max score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => value ?? undefined)
  maxScore?: number;

  @ApiPropertyOptional({ description: 'Exam type' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  examType?: string;

  @ApiPropertyOptional({ description: 'Certification type' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  certificationType?: string;

  @ApiPropertyOptional({ description: 'Publish status' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  publishStatus?: string;

  @ApiPropertyOptional({ description: 'Dirty sections (only changed questions). Omit for metadata-only PATCH.', type: [PatchExamContentSectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PatchExamContentSectionDto)
  @Transform(({ value }) => value ?? [])
  sections?: PatchExamContentSectionDto[];

  @ApiPropertyOptional({ description: 'IDs of removed questions' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => value ?? undefined)
  removedQuestionIds?: string[];

  @ApiPropertyOptional({ description: 'Section metadata updates', type: [PatchSectionMetadataDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PatchSectionMetadataDto)
  @Transform(({ value }) => value ?? undefined)
  sectionMetadata?: PatchSectionMetadataDto[];
}
