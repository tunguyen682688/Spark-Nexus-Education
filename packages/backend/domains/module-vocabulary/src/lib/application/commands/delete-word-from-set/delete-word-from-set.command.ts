export class DeleteWordFromSetCommand {
  constructor(
    public readonly userId: string,
    public readonly setId: string,
    public readonly itemId: string
  ) {}
}

