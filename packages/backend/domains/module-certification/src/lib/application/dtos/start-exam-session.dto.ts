import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StartExamSessionDto {
  @ApiProperty({
    description: 'The ID of the exam to start a session for',
    example: 'exam-uuid-1234',
  })
  @IsNotEmpty()
  @IsString()
  examId!: string;
}
