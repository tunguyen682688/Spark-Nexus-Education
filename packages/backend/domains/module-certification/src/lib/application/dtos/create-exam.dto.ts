import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, MaxLength, IsIn, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SectionTemplateDto {
  @ApiProperty({ description: 'Section title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Section subtitle' })
  @IsString()
  @IsOptional()
  subtitle?: string | null;

  @ApiProperty({ description: 'Section type (listening, reading, etc.)' })
  @IsString()
  @IsNotEmpty()
  sectionType!: string;

  @ApiPropertyOptional({ description: 'Section instruction text' })
  @IsString()
  @IsOptional()
  instruction?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Number of questions in this section' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  questionCount?: number;

  @ApiPropertyOptional({ description: 'Whether this is a break section' })
  @IsOptional()
  isBreak?: boolean;
}

export class CreateExamDto {
  @ApiProperty({ description: 'Exam title', example: 'TOEIC Practice Test 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ description: 'Exam description' })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ description: 'Duration in minutes', example: 60 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ description: 'Total number of questions', example: 100 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalQuestions?: number;

  @ApiPropertyOptional({ description: 'Maximum score', example: 100 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxScore?: number;

  @ApiPropertyOptional({ description: 'Pass score threshold', example: 50 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  passScore?: number;

  @ApiPropertyOptional({
    description: 'Exam type',
    enum: ['FULL_MOCK', 'MINI_TEST', 'SECTION_PRACTICE'],
    example: 'FULL_MOCK',
  })
  @IsString()
  @IsIn(['FULL_MOCK', 'MINI_TEST', 'SECTION_PRACTICE'])
  @IsOptional()
  examType?: string;

  @ApiPropertyOptional({
    description: 'Certificate type (TOEIC, IELTS, CAMBRIDGE, VSTEP, TOEFL, SAT)',
    example: 'TOEIC',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  certificationType?: string;

  @ApiPropertyOptional({
    description: 'Exam level (beginner, intermediate, advanced)',
    example: 'intermediate',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  level?: string;

  @ApiPropertyOptional({
    description: 'Chapter ID to assign this exam to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsOptional()
  chapterId?: string;

  @ApiPropertyOptional({
    description: 'Section templates to auto-create (JSON array of section configs)',
    example: [{ title: 'Listening', sectionType: 'listening', durationMinutes: 45 }],
    type: [SectionTemplateDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionTemplateDto)
  sections?: SectionTemplateDto[];
}
