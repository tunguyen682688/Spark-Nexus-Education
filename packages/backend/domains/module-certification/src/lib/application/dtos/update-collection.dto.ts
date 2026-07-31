import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn, MaxLength, IsBoolean, IsArray } from 'class-validator';

export class UpdateCollectionDto {
  @ApiPropertyOptional({ description: 'Collection title', example: 'TOEIC Full Practice 2024' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Collection description' })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ description: 'Collection subtitle' })
  @IsString()
  @IsOptional()
  subtitle?: string | null;

  @ApiPropertyOptional({ description: 'Difficulty level' })
  @IsString()
  @IsOptional()
  level?: string | null;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Visibility', enum: ['Public', 'Private'] })
  @IsString()
  @IsOptional()
  visibility?: string;

  @ApiPropertyOptional({ description: 'Allow downloads' })
  @IsBoolean()
  @IsOptional()
  allowDownloads?: boolean;

  @ApiPropertyOptional({ description: 'Cover image URL' })
  @IsString()
  @IsOptional()
  coverImage?: string | null;

  @ApiPropertyOptional({ description: 'Publish status', enum: ['draft', 'published', 'archived'] })
  @IsString()
  @IsIn(['draft', 'published', 'archived'])
  @IsOptional()
  publishStatus?: string;
}
