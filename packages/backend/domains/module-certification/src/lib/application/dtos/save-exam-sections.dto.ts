import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class SaveExamSectionItemDto {
  @ApiPropertyOptional({ description: 'Section ID (omit to create new)' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Section title', example: 'Part 1: Photographs' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Section subtitle', example: 'Select the best statement' })
  @IsOptional()
  @IsString()
  subtitle?: string | null;

  @ApiPropertyOptional({ description: 'Section type', example: 'listening' })
  @IsOptional()
  @IsString()
  sectionType?: string;

  @ApiPropertyOptional({ description: 'Section instruction' })
  @IsOptional()
  @IsString()
  instruction?: string | null;

  @ApiProperty({ description: 'Order index', example: 1 })
  @IsNumber()
  order!: number;

  @ApiPropertyOptional({ description: 'Duration in minutes', example: 45 })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Number of questions in this section', example: 10 })
  @IsOptional()
  @IsNumber()
  questionCount?: number;

  @ApiPropertyOptional({ description: 'Whether this is a break section', example: false })
  @IsOptional()
  @IsBoolean()
  isBreak?: boolean;
}

export class SaveExamSectionsDto {
  @ApiProperty({ description: 'Array of sections', type: [SaveExamSectionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveExamSectionItemDto)
  sections!: SaveExamSectionItemDto[];
}
