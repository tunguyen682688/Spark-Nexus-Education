import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpvoteExamSetCommand } from './upvote-exam-set.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { GRAMMAR_EXAM_REPOSITORY } from '../../../domain/repositories/grammar-exam.repository.interface';
import type { IGrammarExamRepository } from '../../../domain/repositories/grammar-exam.repository.interface';

@CommandHandler(UpvoteExamSetCommand)
export class UpvoteExamSetHandler implements ICommandHandler<UpvoteExamSetCommand, any> {
  constructor(
    @Inject(GRAMMAR_EXAM_REPOSITORY)
    private readonly examRepository: IGrammarExamRepository
  ) {}

  async execute(command: UpvoteExamSetCommand): Promise<any> {
    const { id } = command;
    const set = await this.examRepository.findExamSetById(id);
    if (!set) {
      throw new NotFoundException('Không tìm thấy bộ đề thi yêu cầu.');
    }
    return this.examRepository.upvoteExamSet(id);
  }
}
