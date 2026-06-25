import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddArticleCommentDto {
  @ApiProperty({ description: 'Comment content', example: 'This is a great article!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content!: string;
}
