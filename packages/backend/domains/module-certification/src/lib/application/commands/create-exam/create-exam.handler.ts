import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { ExamEntity } from '../../../domain/entities/exam.entity';
import { ExamSectionEntity } from '../../../domain/entities/exam-section.entity';
import { CreateExamCommand } from './create-exam.command';

@CommandHandler(CreateExamCommand)
export class CreateExamCommandHandler implements ICommandHandler<CreateExamCommand> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: CreateExamCommand) {
    const { userId, collectionId, title, description, duration, totalQuestions, maxScore, passScore, examType, certificationType, level, chapterId, sections } = command;

    const collection = await this.repository.findCollectionById(collectionId);
    if (!collection) {
      throw new NotFoundException(`Collection ${collectionId} not found`);
    }

    // Validate chapterId exists if provided, otherwise null it out
    let validChapterId = chapterId ?? null;
    if (validChapterId) {
      const chapter = await this.repository.findChapterById(validChapterId);
      if (!chapter) {
        validChapterId = null;
      }
    }

    const id = crypto.randomUUID();
    const exam = ExamEntity.create({
      id,
      title,
      description: description ?? null,
      duration: duration ?? 60,
      totalQuestions: totalQuestions ?? 0,
      maxScore: maxScore ?? 100,
      passScore: passScore ?? 50,
      collectionId,
      examType: examType ?? 'FULL_MOCK',
      certificationType: certificationType ?? null,
      level: level ?? null,
      chapterId: validChapterId,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.repository.saveExam(exam);

    // Auto-create sections if provided
    if (sections && sections.length > 0) {
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        const sectionEntity = ExamSectionEntity.create({
          id: crypto.randomUUID(),
          examId: saved.id,
          title: sec.title,
          subtitle: sec.subtitle ?? null,
          sectionType: sec.sectionType,
          instruction: sec.instruction ?? null,
          order: i + 1,
          durationMinutes: sec.durationMinutes ?? 0,
          questionCount: sec.questionCount ?? 0,
          isBreak: sec.isBreak ?? false,
        });
        await this.repository.saveExamSection(sectionEntity);
      }
    }

    return {
      id: saved.id,
      title: saved.getTitle(),
      collectionId: saved.getCollectionId(),
      examType: saved.getExamType(),
      certificationType: saved.getCertificationType(),
      level: saved.getLevel(),
    };
  }
}
