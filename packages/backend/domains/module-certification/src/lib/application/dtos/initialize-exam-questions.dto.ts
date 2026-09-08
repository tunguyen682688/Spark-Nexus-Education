import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const CERTIFICATION_TYPES = ['TOEIC', 'IELTS', 'VSTEP', 'CAMBRIDGE'] as const;

export class InitializeExamQuestionsDto {
  @ApiProperty({
    description: 'Certification type',
    enum: CERTIFICATION_TYPES,
    example: 'TOEIC',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(CERTIFICATION_TYPES)
  certificationType!: string;
}
