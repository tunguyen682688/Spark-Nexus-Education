import { Command } from '@nestjs/cqrs';
import { CreateExamSetDto } from '../../dtos/grammar-exam.dtos';

export class CreateExamSetCommand extends Command<any> {
  constructor(
    public readonly userId: string,
    public readonly creatorName: string,
    public readonly dto: CreateExamSetDto
  ) {
    super();
  }
}
