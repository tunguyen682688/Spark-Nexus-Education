import { IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class UpdateListeningProgressDto {
  @IsNumber()
  progress!: number;

  @IsNumber()
  lastPosition!: number;

  @IsNumber()
  timeSpent!: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
