import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SortDirection } from '@spark-nest-ed/shared-libs';

export class GetArticlesQueryDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 10, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @ApiPropertyOptional({ description: 'Max number of items to retrieve (alias for pageSize)', example: 10, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Number of items to skip', example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ description: 'Filter by difficulty level (A1, A2, B1, B2, C1, C2)', example: 'B1' })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Filter by category (news, book, blog, etc.)', example: 'news' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by status (all, in-progress, completed)', example: 'in-progress' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Free-text search query (searches title and content)', example: 'science' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Search query (alias for search)', example: 'science' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Field to sort by', example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort direction (asc or desc)', example: 'desc', enum: SortDirection })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;
}
