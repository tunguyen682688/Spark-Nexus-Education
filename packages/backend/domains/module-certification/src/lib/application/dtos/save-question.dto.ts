import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SaveQuestionOptionDto {
  @ApiProperty({ description: 'Option identifier', example: 'opt-a' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ description: 'Option label', example: 'A' })
  @IsString()
  label!: string;

  @ApiProperty({ description: 'Option answer text', example: 'It offers free certification.' })
  @IsString()
  text!: string;

  @ApiProperty({ description: 'Whether this option is the correct answer', example: false })
  @IsBoolean()
  isCorrect!: boolean;
}

export class SaveQuestionDto {
  @ApiPropertyOptional({ description: 'Question identifier (omit to create a new question)', example: 'Q-000012' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Question text', example: 'According to the advertisement, what is the main benefit?' })
  @IsString()
  @IsNotEmpty()
  questionText!: string;

  @ApiProperty({ description: 'Question type', example: 'Multiple Choice (Single Answer)' })
  @IsString()
  questionType!: string;

  @ApiProperty({ description: 'Difficulty level', example: 'Medium' })
  @IsString()
  difficulty!: string;

  @ApiPropertyOptional({ description: 'Whether options should be shuffled', example: false })
  @IsOptional()
  @IsBoolean()
  shuffleOptions?: boolean;

  @ApiProperty({ description: 'Answer options', type: [SaveQuestionOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveQuestionOptionDto)
  options!: SaveQuestionOptionDto[];

  @ApiPropertyOptional({ description: 'Explanation shown to learners' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ description: 'Points awarded for the question', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({ description: 'Estimated time to answer (mm:ss)', example: '00:45' })
  @IsOptional()
  @IsString()
  estimatedTime?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Skills / objectives', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ description: 'Cognitive level (Bloom taxonomy)', example: 'Understand' })
  @IsOptional()
  @IsString()
  cognitiveLevel?: string;

  @ApiPropertyOptional({ description: 'Save target: exam question or reusable bank item', example: 'exam' })
  @IsOptional()
  @IsString()
  target?: 'exam' | 'bank';
}
