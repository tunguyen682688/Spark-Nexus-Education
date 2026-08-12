import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsInt, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SyncChapterItemDto {
  @ApiProperty({ description: 'Chapter ID (omit for new chapters)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Chapter title', example: 'Reading Section' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Chapter description', required: false })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ description: 'Chapter order', example: 0 })
  @IsInt()
  @Min(0)
  order!: number;

  @ApiProperty({ description: 'Exam IDs to link to this chapter', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  examIds?: string[];
}

export class SyncChaptersDto {
  @ApiProperty({ type: [SyncChapterItemDto], description: 'Chapters to sync' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncChapterItemDto)
  chapters!: SyncChapterItemDto[];
}
