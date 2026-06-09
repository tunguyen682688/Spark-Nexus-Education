import { IsString, IsNumber, IsOptional, IsArray, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExamQuestionDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  text!: string;

  @ApiProperty()
  @IsString()
  @IsIn(['MULTIPLE_CHOICE', 'SENTENCE_BUILDER', 'ERROR_SPOTLIGHT'])
  type!: 'MULTIPLE_CHOICE' | 'SENTENCE_BUILDER' | 'ERROR_SPOTLIGHT';

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiProperty()
  @IsString()
  answer!: string;

  @ApiProperty()
  @IsString()
  explanation!: string;

  @ApiProperty()
  @IsString()
  @IsIn(['syntax', 'tenses', 'morphology', 'modality'])
  category!: 'syntax' | 'tenses' | 'morphology' | 'modality';

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  words?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sentence?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  incorrectWord?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  correctWord?: string;
}

export class CreateExamSetDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsString()
  level!: string; // A1, A2, B1, B2, C1, C2, hoặc ALL

  @ApiProperty()
  @IsString()
  examType!: string; // CEFR, TOEIC, IELTS, VSTEP

  @ApiPropertyOptional()
  @IsOptional()
  examMetadata?: Record<string, any>;

  @ApiProperty()
  @IsNumber()
  timeLimit!: number; // in seconds

  @ApiProperty({ type: [ExamQuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamQuestionDto)
  questions!: ExamQuestionDto[];
}

export class SubmitExamAttemptDto {
  @ApiProperty()
  @IsNumber()
  correctCount!: number;

  @ApiProperty()
  @IsNumber()
  totalCount!: number;
}

