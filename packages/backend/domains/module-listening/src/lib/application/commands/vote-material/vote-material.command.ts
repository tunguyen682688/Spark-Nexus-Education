import { ICommand } from '@nestjs/cqrs';
import { VoteListeningMaterialDto } from '../../dtos/vote-material.dto';

export class VoteListeningMaterialCommand implements ICommand {
  constructor(
    public readonly materialId: string,
    public readonly userId: string,
    public readonly dto: VoteListeningMaterialDto
  ) {}
}
