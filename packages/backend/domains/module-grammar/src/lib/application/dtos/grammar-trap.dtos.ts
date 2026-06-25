import { IsString, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveGrammarTrapDto {
  @ApiProperty({
    description: 'Unique identifier of the question that was answered incorrectly',
    example: 'question-uuid-abc-123',
  })
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @ApiProperty({
    description: 'The question prompt text',
    example: 'Choose the correct verb form: I have _____ (see) that movie already.',
  })
  @IsString()
  @IsNotEmpty()
  questionText!: string;

  @ApiProperty({
    description: 'Format type of the question',
    enum: ['MULTIPLE_CHOICE', 'SENTENCE_BUILDER', 'ERROR_SPOTLIGHT'],
    example: 'MULTIPLE_CHOICE',
  })
  @IsString()
  @IsNotEmpty()
  questionType!: string; // MULTIPLE_CHOICE, SENTENCE_BUILDER, ERROR_SPOTLIGHT

  @ApiProperty({
    description: 'JSON object containing question choices/data structure',
    example: { options: ['saw', 'seen', 'see', 'seeing'] },
  })
  @IsObject()
  @IsNotEmpty()
  questionData!: any; // options, words, sentence, etc.

  @ApiProperty({
    description: 'Grammar category identifier',
    enum: ['syntax', 'tenses', 'morphology', 'modality'],
    example: 'tenses',
  })
  @IsString()
  @IsNotEmpty()
  category!: string; // syntax, tenses, morphology, modality

  @ApiProperty({
    description: 'The incorrect answer chosen by the user',
    example: 'saw',
  })
  @IsString()
  @IsNotEmpty()
  userAnswer!: string;

  @ApiProperty({
    description: 'The correct answer for the question',
    example: 'seen',
  })
  @IsString()
  @IsNotEmpty()
  correctAnswer!: string;

  @ApiProperty({
    description: 'Educational explanation helping the user avoid this mistake next time',
    example: "With the auxiliary verb 'have', we use the past participle form 'seen', not the past simple form 'saw'.",
  })
  @IsString()
  @IsNotEmpty()
  explanation!: string;
}

