import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FeaturedCollectionsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by exam type (e.g. IELTS, TOEIC, TOEFL, Cambridge, VSTEP)', example: 'IELTS' })
  @IsOptional()
  @IsString()
  exam?: string;

  @ApiPropertyOptional({ description: 'Search keyword', example: 'Writing' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number (default 1)', example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Page size limit (default 20)', example: 20, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class SectionQuestionsQueryDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @ApiPropertyOptional({ description: 'Search term', example: 'reading' })
  @IsOptional()
  @IsString()
  search?: string;
}
