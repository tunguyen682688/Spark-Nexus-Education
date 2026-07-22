import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class SaveSessionAnswerDto {
  @ApiProperty({
    description: 'The ID of the question',
    example: 'question-uuid-1234',
  })
  @IsNotEmpty()
  @IsString()
  questionId!: string;

  @ApiProperty({
    description: 'The typed or chosen textual answer (for essay or fill-in-the-blank questions)',
    example: 'This is my text answer.',
    required: false,
  })
  @IsOptional()
  @IsString()
  answerText?: string | null;

  @ApiProperty({
    description: 'Array of choice IDs selected by the user (for multiple choice questions)',
    example: ['choice-uuid-1', 'choice-uuid-2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  choiceIds?: string[];
}
