import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReportCollectionDto {
  @ApiPropertyOptional({
    example: 'Inappropriate content',
    description: 'Reason for reporting the collection',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
