import { Command } from '@nestjs/cqrs';

export interface ChapterInput {
  id?: string;
  title: string;
  description?: string | null;
  order: number;
  examIds?: string[];
}

export class SyncChaptersCommand extends Command<{ id: string }[]> {
  constructor(
    public readonly collectionId: string,
    public readonly userId: string,
    public readonly chapters: ChapterInput[]
  ) {
    super();
  }
}
