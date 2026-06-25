import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubtitleDto {
  @IsNumber()
  startTime!: number;

  @IsNumber()
  endTime!: number;

  @IsString()
  text!: string;

  @IsOptional()
  @IsString()
  translation?: string;

  @IsNumber()
  order!: number;
}

export class CreateQuestionDto {
  @IsString()
  questionText!: string;

  @IsArray()
  options!: string[];

  @IsString()
  correctAnswer!: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsNumber()
  audioTimestamp?: number;

  @IsNumber()
  order!: number;
}

export class CreateListeningMaterialDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category!: string;

  @IsString()
  difficulty!: string;

  @IsString()
  mediaUrl!: string;

  @IsOptional()
  @IsString()
  youtubeId?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsNumber()
  duration!: number;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsBoolean()
  isCommunity?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  vocabularySetId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubtitleDto)
  subtitles?: CreateSubtitleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}
