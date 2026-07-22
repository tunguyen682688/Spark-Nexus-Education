import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class RecordSessionViolationDto {
  @ApiProperty({
    description: 'The type of violation',
    example: 'tab_switch',
  })
  @IsNotEmpty()
  @IsString()
  violationType!: string;

  @ApiProperty({
    description: 'Detailed description of the violation',
    example: 'User switched tabs during the active exam session.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string | null;
}
