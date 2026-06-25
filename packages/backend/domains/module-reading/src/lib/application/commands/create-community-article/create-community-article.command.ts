export class CreateCommunityArticleCommand {
  constructor(
    public readonly userId: string,
    public readonly title: string,
    public readonly content: string,
    public readonly summary?: string,
    public readonly category?: string,
    public readonly tags?: string[],
    public readonly difficulty?: string
  ) {}
}
