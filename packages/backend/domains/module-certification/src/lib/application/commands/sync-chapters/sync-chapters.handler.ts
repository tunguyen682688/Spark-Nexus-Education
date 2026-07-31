import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { SyncChaptersCommand } from './sync-chapters.command';
import { ChapterEntity } from '../../../domain/entities/chapter.entity';
import { randomUUID } from 'crypto';

@CommandHandler(SyncChaptersCommand)
export class SyncChaptersCommandHandler implements ICommandHandler<SyncChaptersCommand, { id: string }[]> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: SyncChaptersCommand): Promise<{ id: string }[]> {
    const collection = await this.repository.findCollectionById(command.collectionId);
    if (!collection) {
      throw new NotFoundException(`Collection "${command.collectionId}" not found`);
    }
    if (collection.getOwnerId() !== command.userId) {
      throw new ForbiddenException('You can only edit your own collections');
    }

    const existingChapters = await this.repository.findChaptersByCollectionId(command.collectionId);
    const existingMap = new Map(existingChapters.map((ch) => [ch.id, ch]));

    const incomingIds = new Set(command.chapters.filter((ch) => ch.id).map((ch) => ch.id!));
    const results: { id: string }[] = [];

    for (const chapterInput of command.chapters) {
      if (chapterInput.id && existingMap.has(chapterInput.id)) {
        const existing = existingMap.get(chapterInput.id)!;
        existing.update({
          title: chapterInput.title,
          description: chapterInput.description,
          order: chapterInput.order,
          updatedBy: command.userId,
        });
        await this.repository.saveChapter(existing);
        results.push({ id: existing.id });
      } else {
        const newId = chapterInput.id && !existingMap.has(chapterInput.id) ? chapterInput.id : randomUUID();
        const chapter = ChapterEntity.create({
          id: newId,
          collectionId: command.collectionId,
          title: chapterInput.title,
          description: chapterInput.description,
          order: chapterInput.order,
          createdBy: command.userId,
          updatedBy: command.userId,
        });
        await this.repository.saveChapter(chapter);
        results.push({ id: newId });
      }
    }

    for (const existing of existingChapters) {
      if (!incomingIds.has(existing.id)) {
        await this.repository.deleteChapter(existing.id);
      }
    }

    // Persist exam ordering within each chapter
    for (const chapterInput of command.chapters) {
      if (chapterInput.examIds && chapterInput.examIds.length > 0) {
        const chapterId = chapterInput.id || results.find((r) => r.id)?.id;
        if (chapterId) {
          for (let idx = 0; idx < chapterInput.examIds.length; idx++) {
            await this.repository.updateExamOrder(chapterInput.examIds[idx], idx);
          }
        }
      }
    }

    return results;
  }
}
