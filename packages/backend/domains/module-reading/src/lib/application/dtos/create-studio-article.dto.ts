import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, IsArray, IsIn, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudioArticleDto {
  @ApiProperty({ description: 'Title of the article', example: 'How to learn effectively' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ description: 'Content of the article', example: 'Learning is a lifelong process...' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ description: 'Summary of the article' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ description: 'Category of the article', example: 'education' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiPropertyOptional({ description: 'Content type', example: 'article' })
  @IsOptional()
  @IsString()
  @IsIn(['article', 'book', 'book_chapter', 'news', 'blog'])
  contentType?: string;

  @ApiPropertyOptional({ description: 'Difficulty level (CEFR)', example: 'B1' })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Tags for the article', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Source URL if copied', example: 'https://example.com/article' })
  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'Original author if applicable', example: 'John Doe' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ description: 'Status of the article', example: 'DRAFT' })
  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'PUBLISHED'])
  status?: string;

  @ApiPropertyOptional({ description: 'Target Language', example: 'en' })
  @IsOptional()
  @IsString()
  targetLanguage?: string;

  @ApiPropertyOptional({ description: 'Audio URL for listening practice', example: 'https://example.com/audio.mp3' })
  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Is bilingual content' })
  @IsOptional()
  @IsBoolean()
  isBilingual?: boolean;

  @ApiPropertyOptional({ description: 'Parent book ID if this is a chapter' })
  @IsOptional()
  @IsString()
  bookId?: string;
}
