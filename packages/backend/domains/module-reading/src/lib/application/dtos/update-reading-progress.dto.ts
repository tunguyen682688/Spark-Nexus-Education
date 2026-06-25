import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReadingProgressDto {
  @ApiProperty({
    description: 'The reading progress percentage (from 0 to 100)',
    example: 45,
    minimum: 0,
    maximum: 100
  })
  @IsInt()
  @Min(0)
  @Max(100)
  progress!: number;

  @ApiProperty({
    description: 'The user\'s last scroll position or line offset',
    example: 1200,
    minimum: 0
  })
  @IsInt()
  @Min(0)
  lastPosition!: number;

  @ApiProperty({
    description: 'Total time spent reading the article in seconds',
    example: 120,
    minimum: 0
  })
  @IsInt()
  @Min(0)
  timeSpent!: number;
}
