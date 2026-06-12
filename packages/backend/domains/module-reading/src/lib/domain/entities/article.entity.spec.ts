import { ArticleEntity } from './article.entity';
import { DifficultyVO, CefrLevel } from '../value-objects/difficulty.vo';

describe('ArticleEntity', () => {
  const makeArticle = () =>
    ArticleEntity.create({
      id: 'article-001',
      title: 'Getting Started with English Learning',
      content: 'English is one of the most widely spoken languages in the world.',
      summary: 'A guide for English beginners.',
      difficulty: DifficultyVO.create('B1'),
      category: 'news',
      tags: ['english', 'beginner'],
      thumbnailUrl: 'https://example.com/thumb.jpg',
      sourceUrl: 'https://example.com/article',
      author: 'John Doe',
    });

  describe('create()', () => {
    it('should create an article entity with correct properties', () => {
      const article = makeArticle();

      expect(article.getId()).toBe('article-001');
      expect(article.getTitle()).toBe('Getting Started with English Learning');
      expect(article.getCategory()).toBe('news');
      expect(article.getDifficulty().getValue()).toBe(CefrLevel.B1);
      expect(article.getIsPublished()).toBe(false);
      expect(article.getPublishedAt()).toBeNull();
      expect(article.getWordCount()).toBeGreaterThan(0);
      expect(article.getTags()).toEqual(['english', 'beginner']);
    });

    it('should calculate word count from content', () => {
      const content = 'one two three four five';
      const article = ArticleEntity.create({
        id: 'a1',
        title: 'Test',
        content,
        difficulty: DifficultyVO.create('A1'),
        category: 'blog',
      });
      expect(article.getWordCount()).toBe(5);
    });
  });

  describe('publish() / unpublish()', () => {
    it('should publish an unpublished article', () => {
      const article = makeArticle();
      expect(article.getIsPublished()).toBe(false);

      article.publish();

      expect(article.getIsPublished()).toBe(true);
      expect(article.getPublishedAt()).toBeInstanceOf(Date);
    });

    it('should not re-publish an already published article', () => {
      const article = makeArticle();
      article.publish();
      const firstPublishedAt = article.getPublishedAt();

      article.publish(); // Called again

      expect(article.getPublishedAt()).toBe(firstPublishedAt); // Should be same reference
    });

    it('should unpublish a published article', () => {
      const article = makeArticle();
      article.publish();
      article.unpublish();

      expect(article.getIsPublished()).toBe(false);
      expect(article.getPublishedAt()).toBeNull();
    });
  });

  describe('updateDetails()', () => {
    it('should update title and category', () => {
      const article = makeArticle();
      article.updateDetails({ title: 'New Title', category: 'blog' });

      expect(article.getTitle()).toBe('New Title');
      expect(article.getCategory()).toBe('blog');
    });

    it('should recalculate wordCount when content is updated', () => {
      const article = makeArticle();
      const newContent = 'word1 word2 word3';
      article.updateDetails({ content: newContent });

      expect(article.getWordCount()).toBe(3);
    });
  });

  describe('fromPersistence()', () => {
    it('should reconstruct entity from raw database record', () => {
      const now = new Date();
      const article = ArticleEntity.fromPersistence({
        id: 'db-001',
        title: 'DB Article',
        content: 'Content from DB.',
        summary: null,
        difficulty: 'C1',
        wordCount: 3,
        category: 'science',
        tags: [],
        thumbnailUrl: null,
        sourceUrl: null,
        author: null,
        isPublished: true,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      expect(article.getId()).toBe('db-001');
      expect(article.getDifficulty().getValue()).toBe(CefrLevel.C1);
      expect(article.getIsPublished()).toBe(true);
    });
  });

  describe('toPersistence()', () => {
    it('should serialize entity to a plain persistence object', () => {
      const article = makeArticle();
      const plain = article.toPersistence();

      expect(plain.id).toBe('article-001');
      expect(plain.title).toBe('Getting Started with English Learning');
      expect(plain.isPublished).toBe(false);
      expect(plain.difficulty).toBe(CefrLevel.B1);
    });
  });
});
