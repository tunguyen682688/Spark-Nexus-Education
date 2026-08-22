import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';

/**
 * DTO for linking a Question (from the bank) to an Exam.
 * Exam-specific format fields are set here because they belong to the
 * ExamQuestion junction record, not the Question bank record.
 */
export class LinkQuestionToExamDto {
  @ApiProperty({ description: 'Exam ID' })
  @IsString()
  @IsNotEmpty()
  examId!: string;

  @ApiProperty({ description: 'Question ID (from the question bank)' })
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @ApiPropertyOptional({ description: 'Order in exam', example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'Points for this question in this exam (overrides bank default)', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({ description: 'Section ID to assign question to' })
  @IsOptional()
  @IsString()
  sectionId?: string;

  // ── Exam-specific format fields (ExamQuestion columns) ──

  @ApiPropertyOptional({ description: 'Audio URL for listening questions (exam-specific)' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Image URL for visual questions (exam-specific)' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Part number for TOEIC (1-7)' })
  @IsOptional()
  @IsNumber()
  partNumber?: number;

  @ApiPropertyOptional({ description: 'Gap number for cloze/gap-fill questions' })
  @IsOptional()
  @IsNumber()
  gapNumber?: number;

  @ApiPropertyOptional({ description: 'Writing task type (essay, letter, report, etc.)' })
  @IsOptional()
  @IsString()
  writingTaskType?: string;

  @ApiPropertyOptional({ description: 'Speaking prompt text' })
  @IsOptional()
  @IsString()
  speakingPrompt?: string;

  @ApiPropertyOptional({ description: 'Whether this is a SAT grid-in question' })
  @IsOptional()
  @IsBoolean()
  isGridIn?: boolean;

  @ApiPropertyOptional({ description: 'Flexible format metadata (JSON)' })
  @IsOptional()
  formatMetadata?: unknown;

  @ApiPropertyOptional({ description: 'Passage group ID for multi-question types (TOEIC Part 6/7)' })
  @IsOptional()
  @IsString()
  passageGroupId?: string;

  @ApiPropertyOptional({ description: 'Blank number within a passage (TOEIC Part 6)' })
  @IsOptional()
  @IsNumber()
  blankNumber?: number;

  @ApiPropertyOptional({ description: 'Sub-question number within a passage (TOEIC Part 7)' })
  @IsOptional()
  @IsNumber()
  subQuestionNumber?: number;

  @ApiPropertyOptional({ description: 'Passage title for multi-question types' })
  @IsOptional()
  @IsString()
  passageTitle?: string;

  @ApiPropertyOptional({ description: 'Passage type (single, double, triple)' })
  @IsOptional()
  @IsString()
  passageType?: string;
}
