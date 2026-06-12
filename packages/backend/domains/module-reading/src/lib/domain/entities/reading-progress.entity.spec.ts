import { ReadingProgressEntity } from './reading-progress.entity';

describe('ReadingProgressEntity', () => {
  const makeProgress = (overrides: Partial<{
    id: string;
    userId: string;
    articleId: string;
    progress: number;
    lastPosition: number;
    timeSpent: number;
  }> = {}) =>
    ReadingProgressEntity.create({
      id: 'progress-001',
      userId: 'user-001',
      articleId: 'article-001',
      progress: 0,
      lastPosition: 0,
      timeSpent: 0,
      ...overrides,
    });

  describe('create()', () => {
    it('should create progress entity with default values', () => {
      const entity = makeProgress();

      expect(entity.getId()).toBe('progress-001');
      expect(entity.getUserId()).toBe('user-001');
      expect(entity.getArticleId()).toBe('article-001');
      expect(entity.getProgress()).toBe(0);
      expect(entity.getLastPosition()).toBe(0);
      expect(entity.getTimeSpent()).toBe(0);
      expect(entity.getCompletedAt()).toBeNull();
    });

    it('should set completedAt when progress starts at 100', () => {
      const entity = makeProgress({ progress: 100 });
      expect(entity.getCompletedAt()).toBeInstanceOf(Date);
    });

    it('should emit a ReadingProgressUpdatedEvent on creation', () => {
      const entity = makeProgress();
      const events = entity.getDomainEvents();
      expect(events.length).toBe(1);
    });
  });

  describe('updateProgress()', () => {
    it('should advance progress', () => {
      const entity = makeProgress({ progress: 30 });
      entity.getDomainEvents(); // Clear initial event

      entity.updateProgress(60, 150, 300);

      expect(entity.getProgress()).toBe(60);
      expect(entity.getLastPosition()).toBe(150);
      expect(entity.getTimeSpent()).toBe(300);
    });

    it('should not decrease progress', () => {
      const entity = makeProgress({ progress: 50 });
      entity.updateProgress(30, 100, 200); // lower than 50

      expect(entity.getProgress()).toBe(50); // Should remain unchanged
    });

    it('should set completedAt when progress reaches 100', () => {
      const entity = makeProgress({ progress: 50 });
      expect(entity.getCompletedAt()).toBeNull();

      entity.updateProgress(100, 999, 600);

      expect(entity.getProgress()).toBe(100);
      expect(entity.getCompletedAt()).toBeInstanceOf(Date);
    });

    it('should throw when progress is out of bounds', () => {
      const entity = makeProgress();
      expect(() => entity.updateProgress(-1, 0, 0)).toThrow();
      expect(() => entity.updateProgress(101, 0, 0)).toThrow();
    });
  });

  describe('fromPersistence()', () => {
    it('should reconstruct entity from raw DB record', () => {
      const now = new Date();
      const entity = ReadingProgressEntity.fromPersistence({
        id: 'db-prog-001',
        userId: 'u1',
        articleId: 'a1',
        progress: 75,
        lastPosition: 200,
        timeSpent: 420,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      expect(entity.getId()).toBe('db-prog-001');
      expect(entity.getProgress()).toBe(75);
    });
  });

  describe('toPersistence()', () => {
    it('should serialize to plain object', () => {
      const entity = makeProgress({ progress: 50, lastPosition: 100, timeSpent: 180 });
      const plain = entity.toPersistence();

      expect(plain.userId).toBe('user-001');
      expect(plain.progress).toBe(50);
      expect(plain.timeSpent).toBe(180);
    });
  });
});
