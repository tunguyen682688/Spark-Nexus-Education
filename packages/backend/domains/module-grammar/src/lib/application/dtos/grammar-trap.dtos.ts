import { IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveGrammarTrapDto {
  @ApiProperty()
  @IsString()
  questionId!: string;

  @ApiProperty()
  @IsString()
  questionText!: string;

  @ApiProperty()
  @IsString()
  questionType!: string; // MULTIPLE_CHOICE, SENTENCE_BUILDER, ERROR_SPOTLIGHT

  @ApiProperty()
  @IsObject()
  questionData!: any; // options, words, sentence, etc.

  @ApiProperty()
  @IsString()
  category!: string; // syntax, tenses, morphology, modality

  @ApiProperty()
  @IsString()
  userAnswer!: string;

  @ApiProperty()
  @IsString()
  correctAnswer!: string;

  @ApiProperty()
  @IsString()
  explanation!: string;
}
