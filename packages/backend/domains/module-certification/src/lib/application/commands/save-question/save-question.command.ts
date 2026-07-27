import { SaveQuestionDto } from '../../dtos/save-question.dto';

export class SaveQuestionCommand {
  constructor(
    public readonly dto: SaveQuestionDto,
    public readonly userId: string
  ) {}
}
