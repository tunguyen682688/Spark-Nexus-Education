import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { ExamEntity } from '../../../domain/entities/exam.entity';
import { ExamSectionEntity } from '../../../domain/entities/exam-section.entity';
import { CreateExamCommand } from './create-exam.command';
import { BullMQService } from '@spark-nest-ed/infrastructure-cache';

@CommandHandler(CreateExamCommand)
export class CreateExamCommandHandler implements ICommandHandler<CreateExamCommand> {
  private readonly logger = new Logger(CreateExamCommandHandler.name);

  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository,
    private readonly bullMQ: BullMQService,
  ) {}

  async execute(command: CreateExamCommand) {
    const { userId, collectionId, title, description, duration, totalQuestions, maxScore, passScore, examType, certificationType, level, chapterId, sections } = command;

    const collection = await this.repository.findCollectionById(collectionId);
    if (!collection) {
      throw new NotFoundException(`Collection ${collectionId} not found`);
    }

    let validChapterId = chapterId ?? null;
    if (chapterId) {
      const chapters = await this.repository.findChaptersByCollectionId(collectionId);
      const chapter = chapters.find((ch) => ch.id === chapterId);
      if (!chapter) {
        throw new NotFoundException(`Chapter ${chapterId} not found in collection ${collectionId}`);
      }
    }

    const examId = crypto.randomUUID();
    const examEntity = ExamEntity.create({
      id: examId,
      collectionId,
      title,
      description: description ?? null,
      duration: duration ?? 0,
      totalQuestions: totalQuestions ?? 0,
      maxScore: maxScore ?? 0,
      passScore: passScore ?? 0,
      examType: examType ?? 'practice',
      certificationType: certificationType ?? null,
      level: level ?? null,
      chapterId: validChapterId,
    });

    const saved = await this.repository.saveExam(examEntity);

    // Create sections if provided
    const savedSections: ExamSectionEntity[] = [];
    if (sections && sections.length > 0) {
      for (let i = 0; i < sections.length; i++) {
        const sectionData = sections[i];
        const sectionEntity = ExamSectionEntity.create({
          id: crypto.randomUUID(),
          examId: saved.id,
          title: sectionData.title,
          order: i,
          sectionType: sectionData.sectionType ?? 'multiple-choice',
          durationMinutes: sectionData.durationMinutes ?? undefined,
          questionCount: sectionData.questionCount ?? 0,
          instruction: sectionData.instruction ?? null,
        });
        const savedSection = await this.repository.saveExamSection(sectionEntity);
        savedSections.push(savedSection);
      }
    }

    // Queue async question initialization for certification exams
    if (certificationType) {
      await this.repository.updateExamInitializationStatus(saved.id, 'pending');
      await this.bullMQ.add(
        'certification-tasks',
        'initialize-exam-questions',
        {
          examId: saved.id,
          userId,
          certificationType,
          sectionIds: savedSections.map((s) => ({ id: s.id, order: s.getOrder() })),
        },
        {
          attempts: 1,
          removeOnComplete: { age: 3600 },
          removeOnFail: { age: 86400 },
        },
      );
      this.logger.log(`Queued initialize-exam-questions for exam ${saved.id}`);
    }

    return {
      id: saved.id,
      title: saved.getTitle(),
      collectionId: saved.getCollectionId(),
      examType: saved.getExamType(),
      certificationType: saved.getCertificationType(),
      level: saved.getLevel(),
      readinessStatus: saved.getPublishStatus(),
    };
  }
}
