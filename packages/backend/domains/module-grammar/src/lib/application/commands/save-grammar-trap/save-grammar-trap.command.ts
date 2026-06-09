import { Command } from '@nestjs/cqrs';
import { SaveGrammarTrapDto } from '../../dtos/grammar-trap.dtos';

export class SaveGrammarTrapCommand extends Command<any> {
  constructor(
    public readonly userId: string,
    public readonly dto: SaveGrammarTrapDto
  ) {
    super();
  }
}
