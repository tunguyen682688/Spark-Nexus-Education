import { IsString, IsOptional, IsArray, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommunityPostDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  hasQuiz?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  quizType?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  quizData?: unknown;
}

export class AddCommunityCommentDto {
  @ApiProperty()
  @IsString()
  content!: string;
}

export class SubmitCrowdsourcedQuizDto {
  @ApiProperty()
  @IsString()
  questionType!: string;

  @ApiProperty()
  @IsObject()
  questionData!: unknown;

  @ApiProperty()
  @IsString()
  explanation!: string;
}
