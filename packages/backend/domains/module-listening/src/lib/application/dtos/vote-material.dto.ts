import { IsNumber, IsIn } from 'class-validator';

export class VoteListeningMaterialDto {
  @IsNumber()
  @IsIn([1, -1])
  vote!: number; // 1 for upvote, -1 for downvote
}
