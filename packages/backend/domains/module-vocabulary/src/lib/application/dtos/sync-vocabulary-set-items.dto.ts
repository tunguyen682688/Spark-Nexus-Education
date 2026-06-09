import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddWordToSetDto } from './add-word-to-set.dto';

export class SyncItemDto extends AddWordToSetDto {
  @ApiPropertyOptional({
    description: 'ID of the VocabularySetItem to update. If null, a new item is created.',
  })
  @IsString()
  @IsOptional()
  id?: string;
}

export class SyncVocabularySetItemsDto {
  @ApiProperty({
        description: 'List of words to add or update',
        type: [SyncItemDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncItemDto)
    items: SyncItemDto[] = [];

  @ApiPropertyOptional({
    description: 'List of item IDs to delete',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  deleteIds?: string[];
}
