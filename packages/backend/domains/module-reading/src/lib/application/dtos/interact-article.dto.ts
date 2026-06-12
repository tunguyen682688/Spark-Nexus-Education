import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ArticleInteractionType {
  UPVOTE = 'UPVOTE',
  DOWNVOTE = 'DOWNVOTE',
  BOOKMARK = 'BOOKMARK',
}

export class InteractArticleDto {
  @ApiProperty({
    description: 'Type of interaction',
    enum: ArticleInteractionType,
    example: ArticleInteractionType.UPVOTE,
  })
  @IsEnum(ArticleInteractionType)
  @IsNotEmpty()
  action!: ArticleInteractionType;
}
