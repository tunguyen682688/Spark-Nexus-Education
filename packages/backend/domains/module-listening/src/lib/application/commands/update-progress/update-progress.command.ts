import { ICommand } from '@nestjs/cqrs';
import { UpdateListeningProgressDto } from '../../dtos/update-progress.dto';

export class UpdateListeningProgressCommand implements ICommand {
  constructor(
    public readonly materialId: string,
    public readonly userId: string,
    public readonly dto: UpdateListeningProgressDto
  ) {}
}
