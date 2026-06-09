import { Command } from "@nestjs/cqrs";
import { UserVocabularyProgressResponseDto } from "../../dtos/flashcard.dto";

export class ReviewFlashcardCommand extends Command<UserVocabularyProgressResponseDto> {
  constructor(
    public readonly userId: string,
    public readonly setId: string,
    public readonly itemId: string,
    public readonly quality: number
  ) {
    super();
  }
}
