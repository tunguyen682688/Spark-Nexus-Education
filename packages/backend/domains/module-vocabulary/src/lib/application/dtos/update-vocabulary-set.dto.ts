import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DifficultyLevel } from '../../domain/value-objects/difficulty.vo';

export class UpdateVocabularySetDto {
  @ApiPropertyOptional({
    description: 'Updated title of vocabulary set',
    example: 'Business Negotiation Vocabulary',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated description',
    example: 'Key terms for international business meetings',
  })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated difficulty level',
    enum: DifficultyLevel,
  })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({
    description: 'Replace tags/categories for the set',
    type: [String],
    example: ['BUSINESS', 'NEGOTIATION'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Visibility of the set',
    enum: ['PUBLIC', 'PRIVATE'],
  })
  @IsEnum(['PUBLIC', 'PRIVATE'])
  @IsOptional()
  visibility?: 'PUBLIC' | 'PRIVATE';
}

