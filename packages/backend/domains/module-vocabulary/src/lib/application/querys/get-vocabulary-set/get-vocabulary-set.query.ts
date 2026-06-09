import { Query } from "@nestjs/cqrs";
import { VocabularySetResponseDto } from "../../dtos/reponse-vocabulary-set.dto";

export class GetVocabularySetQuery extends Query<VocabularySetResponseDto> {
  constructor(public readonly id: string) {
    super();
  }
}