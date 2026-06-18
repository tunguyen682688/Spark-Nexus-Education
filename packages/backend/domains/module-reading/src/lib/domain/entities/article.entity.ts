import { AggregateRoot } from '@spark-nest-ed/shared-libs';
import { DifficultyVO } from '../value-objects/difficulty.vo';

function calculateWordCount(content: string): number {
  if (!content) return 0;
  try {
    const parsed = JSON.parse(content);
    let count = 0;
    
    const countText = (text?: string) => {
      if (!text) return;
      const plain = text.replace(/<[^>]*>?/gm, '').trim();
      if (plain) {
        count += plain.split(/\s+/).length;
      }
    };

    const countBlocks = (blocks: any[]) => {
      if (!Array.isArray(blocks)) return;
      blocks.forEach((block) => {
        if (block.data?.text) {
          countText(block.data.text);
        }
        if (block.type === 'list' && Array.isArray(block.data?.items)) {
          block.data.items.forEach((item: string) => countText(item));
        }
        if (block.type === 'bilingualBlock' && block.data) {
          countText(block.data.original);
          countText(block.data.translation);
        }
      });
    };

    if (parsed.chapters && Array.isArray(parsed.chapters)) {
      parsed.chapters.forEach((ch: any) => {
        if (ch.content && Array.isArray(ch.content.blocks)) {
          countBlocks(ch.content.blocks);
        }
      });
    } else if (parsed.editorData && Array.isArray(parsed.editorData.blocks)) {
      countBlocks(parsed.editorData.blocks);
    } else if (parsed.blocks && Array.isArray(parsed.blocks)) {
      countBlocks(parsed.blocks);
    } else {
      countText(content);
    }
    return count > 0 ? count : 1;
  } catch {
    const clean = content.replace(/<[^>]*>?/gm, '').trim();
    if (!clean) return 1;
    return clean.split(/\s+/).length;
  }
}

export class ArticleEntity extends AggregateRoot<string> {
  private constructor(
    id: string,
    private title: string,
    private content: string,
    private summary: string | null,
    private difficulty: DifficultyVO,
    private wordCount: number,
    private category: string,
    private tags: string[],
    private thumbnailUrl: string | null,
    private sourceUrl: string | null,
    private author: string | null,
    private creatorId: string | null,
    private upvotes: number,
    private downvotes: number,
    private viewCount: number,
    private isCommunity: boolean,
    private isPublished: boolean,
    private publishedAt: Date | null,
    private contentType: string,
    private vocabularySetId: string | null,
    createdAt: Date,
    updatedAt: Date,
    version: bigint
  ) {
    super(id, createdAt, updatedAt, version);
  }

  static create(params: {
    id: string;
    title: string;
    content: string;
    summary?: string | null;
    difficulty: DifficultyVO;
    category: string;
    sourceUrl?: string | null;
    author?: string | null;
    creatorId?: string | null;
    tags?: string[];
    thumbnailUrl?: string | null;
    isCommunity?: boolean;
    contentType?: string;
    vocabularySetId?: string | null;
  }): ArticleEntity {
    const now = new Date();
    const wordCount = calculateWordCount(params.content);

    return new ArticleEntity(
      params.id,
      params.title,
      params.content,
      params.summary || null,
      params.difficulty,
      wordCount,
      params.category,
      params.tags || [],
      params.thumbnailUrl || null,
      params.sourceUrl || null,
      params.author || null,
      params.creatorId || null,
      0, // upvotes
      0, // downvotes
      0, // viewCount
      params.isCommunity || false,
      false, // isPublished defaults to false
      null, // publishedAt defaults to null
      params.contentType || 'article',
      params.vocabularySetId || null,
      now,
      now,
      BigInt(1)
    );
  }

  static fromPersistence(data: {
    id: string;
    title: string;
    content: string;
    summary: string | null;
    difficulty: string;
    wordCount: number;
    category: string;
    tags: string[];
    thumbnailUrl: string | null;
    sourceUrl: string | null;
    author: string | null;
    creatorId: string | null;
    upvotes: number;
    downvotes: number;
    viewCount: number;
    isCommunity: boolean;
    isPublished: boolean;
    publishedAt: Date | null;
    contentType: string;
    vocabularySetId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): ArticleEntity {
    return new ArticleEntity(
      data.id,
      data.title,
      data.content,
      data.summary,
      DifficultyVO.create(data.difficulty),
      data.wordCount,
      data.category,
      data.tags,
      data.thumbnailUrl,
      data.sourceUrl,
      data.author,
      data.creatorId,
      data.upvotes,
      data.downvotes,
      data.viewCount,
      data.isCommunity,
      data.isPublished,
      data.publishedAt,
      data.contentType,
      data.vocabularySetId,
      data.createdAt,
      data.updatedAt,
      BigInt(1)
    );
  }

  publish(): void {
    if (this.isPublished) return;
    this.isPublished = true;
    this.publishedAt = new Date();
    this.markAsUpdated();
  }

  unpublish(): void {
    if (!this.isPublished) return;
    this.isPublished = false;
    this.publishedAt = null;
    this.markAsUpdated();
  }

  upvote(): void {
    this.upvotes += 1;
    this.markAsUpdated();
  }

  downvote(): void {
    this.downvotes += 1;
    this.markAsUpdated();
  }

  incrementView(): void {
    this.viewCount += 1;
    this.markAsUpdated();
  }

  updateDetails(params: {
    title?: string;
    content?: string;
    summary?: string | null;
    difficulty?: DifficultyVO;
    category?: string;
    tags?: string[];
    thumbnailUrl?: string | null;
    sourceUrl?: string | null;
    author?: string | null;
    contentType?: string;
  }): void {
    if (params.title !== undefined) this.title = params.title;
    if (params.content !== undefined) {
      this.content = params.content;
      this.wordCount = calculateWordCount(params.content);
    }
    if (params.summary !== undefined) this.summary = params.summary;
    if (params.difficulty !== undefined) this.difficulty = params.difficulty;
    if (params.category !== undefined) this.category = params.category;
    if (params.tags !== undefined) this.tags = params.tags;
    if (params.thumbnailUrl !== undefined) this.thumbnailUrl = params.thumbnailUrl;
    if (params.sourceUrl !== undefined) this.sourceUrl = params.sourceUrl;
    if (params.author !== undefined) this.author = params.author;
    if (params.contentType !== undefined) this.contentType = params.contentType;

    this.markAsUpdated();
  }

  getId(): string {
    return this._id;
  }

  getTitle(): string {
    return this.title;
  }

  getContent(): string {
    return this.content;
  }

  getSummary(): string | null {
    return this.summary;
  }

  getDifficulty(): DifficultyVO {
    return this.difficulty;
  }

  getWordCount(): number {
    return this.wordCount;
  }

  getCategory(): string {
    return this.category;
  }

  getTags(): string[] {
    return this.tags;
  }

  getThumbnailUrl(): string | null {
    return this.thumbnailUrl;
  }

  getSourceUrl(): string | null {
    return this.sourceUrl;
  }

  getAuthor(): string | null {
    return this.author;
  }

  getCreatorId(): string | null {
    return this.creatorId;
  }

  getUpvotes(): number {
    return this.upvotes;
  }

  getDownvotes(): number {
    return this.downvotes;
  }

  getViewCount(): number {
    return this.viewCount;
  }

  getIsCommunity(): boolean {
    return this.isCommunity;
  }

  getIsPublished(): boolean {
    return this.isPublished;
  }

  getPublishedAt(): Date | null {
    return this.publishedAt;
  }

  toPersistence() {
    return {
      id: this._id,
      title: this.title,
      content: this.content,
      summary: this.summary,
      difficulty: this.difficulty.getValue(),
      wordCount: this.wordCount,
      category: this.category,
      tags: this.tags,
      thumbnailUrl: this.thumbnailUrl,
      sourceUrl: this.sourceUrl,
      author: this.author,
      creatorId: this.creatorId,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      viewCount: this.viewCount,
      isCommunity: this.isCommunity,
      isPublished: this.isPublished,
      publishedAt: this.publishedAt,
      contentType: this.contentType,
      vocabularySetId: this.vocabularySetId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  toPlainObject(): Record<string, unknown> {
    return this.toPersistence() as unknown as Record<string, unknown>;
  }

  getContentType(): string {
    return this.contentType;
  }

  getVocabularySetId(): string | null {
    return this.vocabularySetId;
  }

  setVocabularySetId(id: string | null): void {
    this.vocabularySetId = id;
    this.markAsUpdated();
  }
}
