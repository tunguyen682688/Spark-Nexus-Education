import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class AddBookmarkDto {
  @ApiProperty({ description: 'ID of the item to bookmark', example: 'clxxx...' })
  @IsString()
  itemId!: string;

  @ApiPropertyOptional({ description: 'Type of the item', example: 'collection' })
  @IsOptional()
  @IsString()
  itemType?: string;

  @ApiPropertyOptional({ description: 'Bookmark note', example: 'Important vocabulary set' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Folder name', example: 'My Bookmarks' })
  @IsOptional()
  @IsString()
  folderName?: string;
}
