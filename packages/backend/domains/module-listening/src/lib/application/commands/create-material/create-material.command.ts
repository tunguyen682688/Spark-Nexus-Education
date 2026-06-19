import { ICommand } from '@nestjs/cqrs';
import { CreateListeningMaterialDto } from '../../dtos/create-material.dto';

export class CreateListeningMaterialCommand implements ICommand {
  constructor(
    public readonly dto: CreateListeningMaterialDto,
    public readonly creatorId?: string
  ) {}
}
