import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { VoteListeningMaterialCommand } from './vote-material.command';
import { ListeningService } from '../../../domain/services/listening.service';

@CommandHandler(VoteListeningMaterialCommand)
export class VoteListeningMaterialCommandHandler implements ICommandHandler<VoteListeningMaterialCommand> {
  constructor(
    private readonly listeningService: ListeningService
  ) {}

  async execute(command: VoteListeningMaterialCommand) {
    const { materialId, userId, dto } = command;
    const { vote } = dto;
    return this.listeningService.voteMaterial(userId, materialId, vote);
  }
}
