import { IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitDailyQuizDto {
  @ApiProperty({
    description: 'Score earned from answering daily quiz questions',
    example: 90,
  })
  @IsNumber()
  score!: number;

  @ApiProperty({
    description: 'XP points awarded to the user for completing the quiz',
    example: 15,
  })
  @IsNumber()
  xpEarned!: number;
}

export class SubmitGraduationExamDto {
  @ApiProperty({
    description: 'The correct answers percentage score achieved (0 to 100)',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage!: number;
}

export class SubmitSrsFeedbackDto {
  @ApiProperty({
    description: 'Indicates if the student answered the spaced repetition question correctly',
    example: true,
  })
  @IsBoolean()
  isCorrect!: boolean;
}

