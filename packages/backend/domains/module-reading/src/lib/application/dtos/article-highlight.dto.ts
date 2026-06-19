import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ArticleHighlightDto {
  @ApiProperty({ description: 'ID of the EditorJS block containing highlight', example: 'block-123' })
  @IsString()
  @IsNotEmpty()
  blockId!: string;

  @ApiProperty({ description: '0-based index of the word inside the block text', example: 5 })
  @IsInt()
  @Min(0)
  wordIndex!: number;

  @ApiProperty({ description: 'The exact word that is highlighted', example: 'widely' })
  @IsString()
  @IsNotEmpty()
  occurrenceText!: string;

  @ApiProperty({ description: 'Foreign key to Entry (system vocabulary)', example: 'entry-uuid' })
  @IsString()
  @IsNotEmpty()
  entryId!: string;

  @ApiPropertyOptional({ description: 'Custom definition overriding global definition' })
  @IsOptional()
  @IsString()
  customDefinition?: string;

  @ApiPropertyOptional({ description: 'Custom example sentence' })
  @IsOptional()
  @IsString()
  customExample?: string;

  @ApiPropertyOptional({ description: 'Custom example translation' })
  @IsOptional()
  @IsString()
  customExampleTrans?: string;
}
