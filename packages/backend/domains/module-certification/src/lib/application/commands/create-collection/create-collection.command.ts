import { Command } from '@nestjs/cqrs';

export class CreateCollectionCommand extends Command<{ id: string; title: string; description: string | null }> {
  constructor(
    public readonly userId: string,
    public readonly title: string,
    public readonly description?: string | null
  ) {
    super();
  }
}
