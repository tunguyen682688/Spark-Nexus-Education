import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SaveQuestionCommand } from './save-question.command';
import type {
  ICertificationRepository,
} from '../../../domain/repositories/certification.repository.interface';
import { CERTIFICATION_REPOSITORY } from '../../../domain/repositories/certification.repository.interface';
import { QuestionEntity } from '../../../domain/entities/question.entity';
import { QuestionChoiceEntity } from '../../../domain/entities/question-choice.entity';
import { QuestionMetadataEntity } from '../../../domain/entities/question-metadata.entity';

export interface SaveQuestionResultDto {
  id: string;
  questionText: string;
  questionType: string;
  difficulty: string;
  options: Array<{
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
  }>;
  properties: {
    id: string;
    points: number;
    estimatedTime: string;
    tags: string[];
    skills: string[];
    cognitiveLevel: string;
    updatedBy: string;
  };
  savedToBank: boolean;
  status: string;
}

@CommandHandler(SaveQuestionCommand)
export class SaveQuestionHandler
  implements ICommandHandler<SaveQuestionCommand, SaveQuestionResultDto>
{
  private readonly logger = new Logger(SaveQuestionHandler.name);

  constructor(
    @Inject(CERTIFICATION_REPOSITORY)
    private readonly repo: ICertificationRepository
  ) {}

  async execute(command: SaveQuestionCommand): Promise<SaveQuestionResultDto> {
    const { dto, userId } = command;
    const questionId = dto.id || randomUUID();
    const isUpdate = !!dto.id;

    this.logger.log(
      `${isUpdate ? 'Updating' : 'Creating'} question ${questionId} by user ${userId}`
    );

    // 1. Create QuestionEntity
    const question = QuestionEntity.create({
      id: questionId,
      content: dto.questionText,
      type: dto.questionType,
      difficulty: dto.difficulty,
      category: dto.category || null,
      status: 'draft',
      createdBy: userId,
      updatedBy: userId,
    });

    // 2. Create QuestionChoiceEntities
    const choices = dto.options.map((opt, index) =>
      QuestionChoiceEntity.create({
        id: opt.id || randomUUID(),
        questionId,
        content: opt.text,
        isCorrect: opt.isCorrect,
        order: index,
        createdBy: userId,
        updatedBy: userId,
      })
    );

    // 3. Create QuestionMetadataEntity
    const metadata = QuestionMetadataEntity.create({
      id: randomUUID(),
      questionId,
      explanation: dto.explanation || null,
      points: dto.points || 1,
      estimatedTime: dto.estimatedTime || null,
      shuffleOptions: dto.shuffleOptions || false,
      referenceType: dto.referenceType || null,
      passageSource: dto.passageSource || null,
      highlight: dto.highlight || null,
      cognitiveLevel: dto.cognitiveLevel || null,
      tags: dto.tags || [],
      skills: dto.skills || [],
      passageId: dto.passageId || null,
      passageText: dto.passageText || null,
      modelAnswer: dto.modelAnswer || null,
      rubric: dto.rubric || null,
      matchingPairs: dto.matchingPairs || null,
      wordRoot: dto.wordRoot || null,
      keyWord: dto.keyWord || null,
    });

    // Calculate quality score
    metadata.calculateQualityScore();

    // 4. Save to database (format fields go to ExamQuestion when linked)
    await this.repo.saveQuestionWithChoices(question, choices, metadata);

    this.logger.log(`Question ${questionId} saved successfully`);

    // 5. Build response
    const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    return {
      id: questionId,
      questionText: dto.questionText,
      questionType: dto.questionType,
      difficulty: dto.difficulty,
      options: dto.options.map((opt, index) => ({
        id: opt.id || `opt-${index}`,
        label: labels[index] || `Option ${index + 1}`,
        text: opt.text,
        isCorrect: opt.isCorrect,
      })),
      properties: {
        id: questionId,
        points: dto.points || 1,
        estimatedTime: dto.estimatedTime || '00:00',
        tags: dto.tags || [],
        skills: dto.skills || [],
        cognitiveLevel: dto.cognitiveLevel || 'Understand',
        updatedBy: userId,
      },
      savedToBank: dto.target === 'bank',
      status: 'All changes saved',
    };
  }
}
