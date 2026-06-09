import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SaveGrammarTrapCommand } from './save-grammar-trap.command';
import { Inject } from '@nestjs/common';
import * as grammarTrapRepositoryInterface from '../../../domain/repositories/grammar-trap.repository.interface';

@CommandHandler(SaveGrammarTrapCommand)
export class SaveGrammarTrapHandler
  implements ICommandHandler<SaveGrammarTrapCommand, any>
{
  constructor(
    @Inject(grammarTrapRepositoryInterface.GRAMMAR_TRAP_REPOSITORY)
    private readonly trapRepository: grammarTrapRepositoryInterface.IGrammarTrapRepository
  ) {}

  async execute(command: SaveGrammarTrapCommand): Promise<any> {
    const { userId, dto } = command;
    const trap = await this.trapRepository.upsertTrap(userId, dto.questionId, {
      questionText: dto.questionText,
      questionType: dto.questionType,
      questionData: dto.questionData,
      category: dto.category,
      userAnswer: dto.userAnswer,
      correctAnswer: dto.correctAnswer,
      explanation: dto.explanation,
      status: 'TRAPPED',
    });

    return {
      success: true,
      data: trap,
    };
  }
}
