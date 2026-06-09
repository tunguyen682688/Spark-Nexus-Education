import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetEntryDetailQuery } from "./get-entry-detail.query";
import { WordFullDto, SenseDto, ExampleDto, ExpressionDto, LexicalVariantDto } from "../../dtos/reponse-word.dto";
import { Inject, NotFoundException } from "@nestjs/common";
import * as entryRepositoryInterface from "../../../domain/repositories/entry.repository.interface";

@QueryHandler(GetEntryDetailQuery)
export class GetEntryDetailQueryHandler implements IQueryHandler<GetEntryDetailQuery, WordFullDto> {
  constructor(
    @Inject(entryRepositoryInterface.ENTRY_REPOSITORY)
    private readonly entryRepository: entryRepositoryInterface.IEntryRepository,
  ) {}

  async execute(query: GetEntryDetailQuery): Promise<WordFullDto> {
    const entry = await this.entryRepository.findByIdWithDetails(query.entryId);
    
    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    // Map senses
    const senses: SenseDto[] = entry.senses.map((sense) => ({
      id: sense.id,
      definition: sense.definition,
      partOfSpeech: sense.partOfSpeech,
      level: sense.level,
      topic: sense.topic,
      synonym: sense.synonym,
      antonym: sense.antonym,
      usage: sense.usage,
      etymologyText: sense.etymologyText,
      fieldOfStudy: sense.fieldOfStudy,
      note: sense.note,
      seeAlso: sense.seeAlso,
      images: sense.images,
    }));

    // Map examples
    const examples: ExampleDto[] = entry.examples.map((ex) => ({
      id: ex.id,
      exampleText: ex.exampleText,
      translation: ex.translation,
    }));

    // Map expressions
    const expressions: ExpressionDto[] = entry.expressions.map((expr) => ({
      id: expr.id,
      expression: expr.expression,
      meanings: expr.meanings.map((m) => ({
        id: m.id,
        meaningText: m.meaningText,
        meaningOrder: m.meaningOrder,
        usageNotes: m.usageNotes,
      })),
    }));

    // Map lexical variants
    const lexicalVariants: LexicalVariantDto[] = entry.variants.map((variant) => ({
      id: variant.id,
      partOfSpeech: variant.partOfSpeech,
      pronunciation: variant.pronunciation,
      notes: variant.notes,
    }));

    return {
      id: entry.id,
      word: entry.word,
      language: entry.language,
      pronunciation: entry.pronunciation,
      partOfSpeech: entry.partOfSpeech,
      frequency: entry.frequency,
      isDraft: entry.isDraft,
      isPublished: entry.isPublished,
      notes: entry.notes,
      sourceUrl: entry.sourceUrl,
      tags: entry.tags,
      audioUrl: entry.audioUrl,
      senses,
      examples,
      expressions,
      lexicalVariants,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }
}

