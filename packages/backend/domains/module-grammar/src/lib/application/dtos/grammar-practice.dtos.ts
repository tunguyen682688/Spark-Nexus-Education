import { IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitDailyQuizDto {
  @ApiProperty()
  @IsNumber()
  score!: number;

  @ApiProperty()
  @IsNumber()
  xpEarned!: number;
}

export class SubmitGraduationExamDto {
  @ApiProperty()
  @IsNumber()
  percentage!: number;
}

export class SubmitSrsFeedbackDto {
  @ApiProperty()
  @IsBoolean()
  isCorrect!: boolean;
}
