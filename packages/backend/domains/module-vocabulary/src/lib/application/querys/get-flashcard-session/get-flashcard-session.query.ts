import { Query } from "@nestjs/cqrs";
import { FlashcardSessionResponseDto } from "../../dtos/flashcard.dto";

export class GetFlashcardSessionQuery extends Query<FlashcardSessionResponseDto> {
  constructor(
    public readonly userId: string,
    public readonly setId: string,
    public readonly reviewAll?: boolean
  ) {
    super();
  }
}
