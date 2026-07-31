import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty({ description: 'Collection title', example: 'TOEIC Full Practice 2024' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ description: 'Collection description', example: 'Full TOEIC practice set with 10 mock tests' })
  @IsString()
  @IsOptional()
  description?: string | null;
}
