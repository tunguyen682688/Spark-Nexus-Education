export class InteractArticleCommand {
  constructor(
    public readonly userId: string,
    public readonly articleId: string,
    public readonly action: 'UPVOTE' | 'DOWNVOTE' | 'BOOKMARK' | 'VIEW'
  ) {}
}
