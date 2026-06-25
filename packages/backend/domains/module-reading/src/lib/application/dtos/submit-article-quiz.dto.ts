import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitArticleQuizDto {
  @ApiProperty({
    description: 'Map of question IDs to selected option answers',
    example: { 'q1': 'Option A', 'q2': 'Option C' }
  })
  @IsObject()
  answers!: Record<string, string>;
}
