import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateExamSetCommand } from './create-exam-set.command';
import { Inject } from '@nestjs/common';
import { GRAMMAR_EXAM_REPOSITORY } from '../../../domain/repositories/grammar-exam.repository.interface';
import type { IGrammarExamRepository } from '../../../domain/repositories/grammar-exam.repository.interface';

@CommandHandler(CreateExamSetCommand)
export class CreateExamSetHandler implements ICommandHandler<CreateExamSetCommand, any> {
  constructor(
    @Inject(GRAMMAR_EXAM_REPOSITORY)
    private readonly examRepository: IGrammarExamRepository
  ) {}

  async execute(command: CreateExamSetCommand): Promise<any> {
    const { userId, creatorName, dto } = command;
    return this.examRepository.createExamSet(userId, creatorName, dto);
  }
}
