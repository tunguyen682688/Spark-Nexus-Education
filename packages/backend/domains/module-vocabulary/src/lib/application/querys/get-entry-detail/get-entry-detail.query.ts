import { Query } from "@nestjs/cqrs";
import { WordFullDto } from "../../dtos/reponse-word.dto";

export class GetEntryDetailQuery extends Query<WordFullDto> {
  constructor(public readonly entryId: string) {
    super();
  }
}

