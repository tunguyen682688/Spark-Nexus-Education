export class DeleteVocabularySetCommand {
  constructor(
    public readonly userId: string,
    public readonly setId: string
  ) {}
}

