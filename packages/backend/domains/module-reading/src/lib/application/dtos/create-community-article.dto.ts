import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommunityArticleDto {
  @ApiProperty({ description: 'Title of the article', example: 'How to learn effectively' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ description: 'Content of the article', example: 'Learning is a lifelong process...' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ description: 'Category of the article', example: 'education' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiPropertyOptional({ description: 'Source URL if copied', example: 'https://example.com/article' })
  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'Original author if applicable', example: 'John Doe' })
  @IsOptional()
  @IsString()
  author?: string;
}
