export class CreateStudioArticleCommand {
  constructor(
    public readonly userId: string,
    public readonly title: string,
    public readonly content: string,
    public readonly category: string,
    public readonly summary?: string,
    public readonly difficulty?: string,
    public readonly tags?: string[],
    public readonly thumbnailUrl?: string,
    public readonly sourceUrl?: string,
    public readonly author?: string,
    public readonly status?: string
  ) {}
}
