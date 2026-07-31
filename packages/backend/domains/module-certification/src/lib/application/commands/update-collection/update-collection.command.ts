import { Command } from '@nestjs/cqrs';

export class UpdateCollectionCommand extends Command<{ id: string }> {
  constructor(
    public readonly collectionId: string,
    public readonly userId: string,
    public readonly title?: string,
    public readonly description?: string | null,
    public readonly subtitle?: string | null,
    public readonly level?: string | null,
    public readonly tags?: string[],
    public readonly visibility?: string,
    public readonly allowDownloads?: boolean,
    public readonly coverImage?: string | null,
    public readonly publishStatus?: string
  ) {
    super();
  }
}
