import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IEntryRepository } from '../../domain/repositories/entry.repository.interface';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';

@Injectable()
export class EntryRepository implements IEntryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const entry = await this.prisma.entry.findUnique({
      where: { id },
      select: { id: true, word: true, language: true },
    });
    return entry
      ? {
          id: entry.id,
          word: entry.word,
          language: entry.language,
          definition: null,
          example: null,
        }
      : null;
  }

  async findByWord(word: string, language: string) {
    const entry = await this.prisma.entry.findFirst({
      where: { word: { equals: word, mode: 'insensitive' }, language },
      select: { id: true, word: true, language: true },
    });
    return entry
      ? {
          id: entry.id,
          word: entry.word,
          language: entry.language,
          definition: null,
          example: null,
        }
      : null;
  }

  async findByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    const entries = await this.prisma.entry.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        word: true,
        language: true,
        senses: {
          select: { definition: true },
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
        examples: {
          select: { exampleText: true },
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return entries.map((entry) => ({
      id: entry.id,
      word: entry.word,
      language: entry.language,
      definition: entry.senses[0]?.definition || null,
      example: entry.examples[0]?.exampleText || null,
    }));
  }

  async findByWords(words: string[], language: string) {
    const sanitizedWords = Array.from(
      new Set(
        words
          .map((word) => word?.trim())
          .filter((word): word is string => !!word && word.length > 0)
      )
    );

    if (sanitizedWords.length === 0) {
      return [];
    }

    const where: Prisma.EntryWhereInput = {
      language,
      OR: sanitizedWords.map((word) => ({
        word: { equals: word, mode: 'insensitive' },
      })),
    };

    const entries = await this.prisma.entry.findMany({
      where,
      select: {
        id: true,
        word: true,
        language: true,
        partOfSpeech: true,
        senses: {
          select: { definition: true },
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
        examples: {
          select: { exampleText: true },
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return entries.map((entry) => ({
      id: entry.id,
      word: entry.word,
      language: entry.language,
      definition: entry.senses[0]?.definition || null,
      example: entry.examples[0]?.exampleText || null,
      partOfSpeech: entry.partOfSpeech,
    }));
  }

  async createBasicEntry(input: {
    word: string;
    language: string;
    definition?: string;
    example?: string;
    partOfSpeech?: string;
  }) {
    const trimmedWord = input.word.trim();

    const entry = await this.prisma.entry.create({
      data: {
        word: trimmedWord,
        language: input.language,
        partOfSpeech: input.partOfSpeech ?? null,
        notes: null,
        tags: [],
        isDraft: false,
        isPublished: false,
      },
      select: {
        id: true,
        word: true,
        language: true,
      },
    });

    if (input.definition) {
      await this.prisma.sense.create({
        data: {
          entryId: entry.id,
          definition: input.definition,
          language: input.language,
          // meaningOrder property removed: not part of type
        },
      });
    }

    if (input.example) {
      await this.prisma.example.create({
        data: {
          entryId: entry.id,
          exampleText: input.example,
          language: input.language,
        },
      });
    }

    return {
      id: entry.id,
      word: entry.word,
      language: entry.language,
      definition: input.definition ?? null,
      example: input.example ?? null,
    };
  }

  async findByIdWithDetails(id: string) {
    const entry = await this.prisma.entry.findUnique({
      where: { id, deleted: false },
      include: {
        senses: {
          where: { deleted: false },
          orderBy: { createdAt: 'asc' },
        },
        examples: {
          where: { deleted: false },
          orderBy: { createdAt: 'asc' },
        },
        expressions: {
          where: { deleted: false },
          include: {
            meanings: {
              where: { deleted: false },
              orderBy: { meaningOrder: 'asc' },
            },
          },
        },
        variants: {
          where: { deleted: false },
        },
        expressionMeanings: {
          where: { deleted: false },
          orderBy: { meaningOrder: 'asc' },
        },

      },
    });

    if (!entry) {
      return null;
    }

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
      senses: entry.senses.map((sense) => ({
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
      })),
      examples: entry.examples.map((ex) => ({
        id: ex.id,
        exampleText: ex.exampleText,
        translation: ex.translation,
      })),
      expressions: entry.expressions.map((expr) => ({
        id: expr.id,
        expression: expr.expression,
        meanings: expr.meanings.map((m) => ({
          id: m.id,
          meaningText: m.meaningText,
          meaningOrder: m.meaningOrder,
          usageNotes: m.usageNotes,
        })),
      })),
      variants: entry.variants.map((variant) => ({
        id: variant.id,
        partOfSpeech: variant.partOfSpeech,
        pronunciation: variant.pronunciation,
        notes: variant.notes,
      })),
      expressionMeanings: entry.expressionMeanings.map((meaning) => ({
        id: meaning.id,
        meaningText: meaning.meaningText,
        meaningOrder: meaning.meaningOrder,
        usageNotes: meaning.usageNotes,
      })),
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }

  async findByIdsMinimum(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    const entries = await this.prisma.entry.findMany({
      where: { id: { in: ids }, deleted: false },
      select: {
        id: true,
        word: true,
        pronunciation: true,
        partOfSpeech: true,
        senses: {
          select: { definition: true },
          take: 1,
          orderBy: { createdAt: 'asc' },
          where: { deleted: false },
        },
        examples: {
          select: { exampleText: true },
          take: 1,
          orderBy: { createdAt: 'asc' },
          where: { deleted: false },
        },
      },
    });

    return entries.map((entry) => ({
      id: entry.id,
      word: entry.word,
      definition: entry.senses[0]?.definition || null,
      example: entry.examples[0]?.exampleText || null,
      pronunciation: entry.pronunciation,
      partOfSpeech: entry.partOfSpeech,
    }));
  }

  async updateEntry(
    id: string,
    data: {
      word?: string;
      definition?: string | null;
      example?: string | null;
      partOfSpeech?: string | null;
    }
  ) {
    // Update entry basic fields
    const updateData: Prisma.EntryUpdateInput = {};
    if (data.word !== undefined) {
      updateData.word = data.word.trim();
    }
    if (data.partOfSpeech !== undefined) {
      updateData.partOfSpeech = data.partOfSpeech;
    }

    const entry = await this.prisma.entry.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        word: true,
        partOfSpeech: true,
        senses: {
          select: { id: true, definition: true },
          take: 1,
          orderBy: { createdAt: 'asc' },
          where: { deleted: false },
        },
        examples: {
          select: { id: true, exampleText: true },
          take: 1,
          orderBy: { createdAt: 'asc' },
          where: { deleted: false },
        },
      },
    });

    // Update or create definition (Sense)
    if (data.definition !== undefined) {
      if (entry.senses.length > 0) {
        // Update existing sense
        await this.prisma.sense.update({
          where: { id: entry.senses[0].id },
          data: { definition: data.definition || '' },
        });
      } else if (data.definition) {
        // Create new sense
        const entryWithLanguage = await this.prisma.entry.findUnique({
          where: { id },
          select: { language: true },
        });
        await this.prisma.sense.create({
          data: {
            entryId: id,
            definition: data.definition,
            language: entryWithLanguage?.language || 'en',
          },
        });
      }
    }

    // Update or create example
    if (data.example !== undefined) {
      if (entry.examples.length > 0) {
        // Update existing example
        await this.prisma.example.update({
          where: { id: entry.examples[0].id },
          data: { exampleText: data.example || '' },
        });
      } else if (data.example) {
        // Create new example
        const entryWithLanguage = await this.prisma.entry.findUnique({
          where: { id },
          select: { language: true },
        });
        await this.prisma.example.create({
          data: {
            entryId: id,
            exampleText: data.example,
            language: entryWithLanguage?.language || 'en',
          },
        });
      }
    }

    // Fetch updated data
    const updatedEntry = await this.prisma.entry.findUnique({
      where: { id },
      select: {
        id: true,
        word: true,
        partOfSpeech: true,
        senses: {
          select: { definition: true },
          take: 1,
          orderBy: { createdAt: 'asc' },
          where: { deleted: false },
        },
        examples: {
          select: { exampleText: true },
          take: 1,
          orderBy: { createdAt: 'asc' },
          where: { deleted: false },
        },
      },
    });

    return {
      id: updatedEntry!.id,
      word: updatedEntry!.word,
      definition: updatedEntry!.senses[0]?.definition || null,
      example: updatedEntry!.examples[0]?.exampleText || null,
      partOfSpeech: updatedEntry!.partOfSpeech,
    };
  }
}
