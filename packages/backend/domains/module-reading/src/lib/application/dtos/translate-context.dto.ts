import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TranslateContextDto {
  @ApiProperty({
    description: 'The vocabulary word to translate',
    example: 'anomaly'
  })
  @IsString()
  @IsNotEmpty()
  word!: string;

  @ApiProperty({
    description: 'The full sentence context containing the word',
    example: 'The weather today is an anomaly compared to last week.'
  })
  @IsString()
  @IsNotEmpty()
  sentence!: string;
}
