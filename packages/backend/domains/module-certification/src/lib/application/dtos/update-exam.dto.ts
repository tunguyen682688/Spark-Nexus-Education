import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsIn, MaxLength } from 'class-validator';

export class UpdateExamDto {
  @ApiPropertyOptional({ description: 'Exam title', example: 'TOEIC Practice Test 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Exam description' })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ description: 'Total number of questions' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalQuestions?: number;

  @ApiPropertyOptional({ description: 'Maximum score' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxScore?: number;

  @ApiPropertyOptional({ description: 'Pass score threshold' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  passScore?: number;

  @ApiPropertyOptional({ description: 'Publish status', enum: ['draft', 'published', 'archived'] })
  @IsString()
  @IsIn(['draft', 'published', 'archived'])
  @IsOptional()
  publishStatus?: string;
}
