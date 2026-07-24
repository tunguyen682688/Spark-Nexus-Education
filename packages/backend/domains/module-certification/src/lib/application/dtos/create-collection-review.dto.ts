import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateCollectionReviewDto {
  @ApiProperty({ description: 'Rating score from 1 to 5', example: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ description: 'Review feedback text', example: 'Excellent mock test collection with detailed answer keys!' })
  @IsString()
  @IsNotEmpty()
  text!: string;
}
