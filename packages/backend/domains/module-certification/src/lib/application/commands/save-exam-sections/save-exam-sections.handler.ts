import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { SaveExamSectionsCommand } from './save-exam-sections.command';
import { ExamSectionEntity } from '../../../domain/entities/exam-section.entity';

@CommandHandler(SaveExamSectionsCommand)
export class SaveExamSectionsCommandHandler
  implements ICommandHandler<SaveExamSectionsCommand, ExamSectionEntity[]>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: SaveExamSectionsCommand): Promise<ExamSectionEntity[]> {
    const { examId, userId, sections } = command;

    const exam = await this.repository.findExamById(examId);
    if (!exam) {
      throw new NotFoundException(`Exam ${examId} not found`);
    }

    const collection = await this.repository.findCollectionById(exam.getCollectionId());
    if (!collection || collection.getOwnerId() !== userId) {
      throw new ForbiddenException('You can only edit sections in your own exams');
    }

    // Get existing section IDs to determine which are new vs updated
    const existingSections = await this.repository.findSectionsByExamId(examId);
    const existingIds = new Set(existingSections.map((s) => s.id));
    const incomingIds = new Set(sections.filter((s) => s.id).map((s) => s.id!));

    // Delete sections that are no longer in the incoming list
    for (const existingId of existingIds) {
      if (!incomingIds.has(existingId)) {
        await this.repository.deleteExamSection(existingId);
      }
    }

    // Create or update sections
    const saved: ExamSectionEntity[] = [];
    for (const sec of sections) {
      const sectionEntity = ExamSectionEntity.create({
        id: sec.id || randomUUID(),
        examId,
        title: sec.title,
        subtitle: sec.subtitle ?? null,
        sectionType: sec.sectionType ?? 'general',
        instruction: sec.instruction ?? null,
        order: sec.order,
        durationMinutes: sec.durationMinutes ?? 0,
        questionCount: sec.questionCount ?? 0,
        isBreak: sec.isBreak ?? false,
      });
      const result = await this.repository.saveExamSection(sectionEntity);
      saved.push(result);
    }

    return saved;
  }
}
