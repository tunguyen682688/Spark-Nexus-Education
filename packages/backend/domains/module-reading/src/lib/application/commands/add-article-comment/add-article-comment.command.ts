export class AddArticleCommentCommand {
  constructor(
    public readonly userId: string,
    public readonly articleId: string,
    public readonly content: string
  ) {}
}
