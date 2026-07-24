import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCollectionDiscussionDto {
  @ApiProperty({ description: 'Discussion thread title', example: 'Question regarding Essay 2 vocabulary list' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Discussion question or content', example: 'Could anyone clarify the difference between coherent and cohesive structures in Part 3?' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}
