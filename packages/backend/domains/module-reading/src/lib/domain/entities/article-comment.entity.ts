import { AggregateRoot } from '@spark-nest-ed/shared-libs';

export class ArticleCommentEntity extends AggregateRoot<string> {
  private constructor(
    id: string,
    private articleId: string,
    private userId: string,
    private content: string,
    private upvotes: number,
    private downvotes: number,
    createdAt: Date,
    updatedAt: Date,
    version: bigint
  ) {
    super(id, createdAt, updatedAt, version);
  }

  static create(params: {
    id: string;
    articleId: string;
    userId: string;
    content: string;
  }): ArticleCommentEntity {
    const now = new Date();
    return new ArticleCommentEntity(
      params.id,
      params.articleId,
      params.userId,
      params.content,
      0, // upvotes
      0, // downvotes
      now,
      now,
      BigInt(1)
    );
  }

  static fromPersistence(data: {
    id: string;
    articleId: string;
    userId: string;
    content: string;
    upvotes: number;
    downvotes: number;
    createdAt: Date;
    updatedAt: Date;
  }): ArticleCommentEntity {
    return new ArticleCommentEntity(
      data.id,
      data.articleId,
      data.userId,
      data.content,
      data.upvotes,
      data.downvotes,
      data.createdAt,
      data.updatedAt,
      BigInt(1)
    );
  }

  upvote(): void {
    this.upvotes += 1;
    this.markAsUpdated();
  }

  downvote(): void {
    this.downvotes += 1;
    this.markAsUpdated();
  }

  updateContent(content: string): void {
    this.content = content;
    this.markAsUpdated();
  }

  getId(): string {
    return this._id;
  }

  getArticleId(): string {
    return this.articleId;
  }

  getUserId(): string {
    return this.userId;
  }

  getContent(): string {
    return this.content;
  }

  getUpvotes(): number {
    return this.upvotes;
  }

  getDownvotes(): number {
    return this.downvotes;
  }

  toPersistence() {
    return {
      id: this._id,
      articleId: this.articleId,
      userId: this.userId,
      content: this.content,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  toPlainObject(): Record<string, unknown> {
    return this.toPersistence();
  }
}
