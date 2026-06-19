import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TranslateParagraphDto {
  @ApiProperty({
    description: 'The paragraph text to translate',
    example: 'English is one of the most widely spoken languages in the world.'
  })
  @IsString()
  @IsNotEmpty()
  text!: string;
}
