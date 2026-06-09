import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddWordPayloadDto {
  @ApiPropertyOptional({
    description: 'Word text (required for new words, optional for updates)',
    example: 'leverage',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  word?: string;

  @ApiPropertyOptional({
    description: 'Definition for this word in context of the set',
    example: 'To use something to maximum advantage',
  })
  @IsString()
  @IsOptional()
  definition?: string;

  @ApiPropertyOptional({
    description: 'Example sentence',
    example: 'We need to leverage our brand reputation.',
  })
  @IsString()
  @IsOptional()
  example?: string;

  @ApiPropertyOptional({
    description: 'Personal notes',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Part of speech (noun, verb, adjective, ...)',
    example: 'noun',
  })
  @IsString()
  @IsOptional()
  partOfSpeech?: string;
}

export class AddWordToSetDto {
  @ApiPropertyOptional({
    description: 'Existing entry ID to attach to this set',
  })
  @IsString()
  @IsOptional()
  wordId?: string;

  @ApiPropertyOptional({
    description: 'Word payload when creating/using custom entry',
    type: AddWordPayloadDto,
  })
  @ValidateNested()
  @Type(() => AddWordPayloadDto)
  @IsOptional()
  word?: AddWordPayloadDto;
}


