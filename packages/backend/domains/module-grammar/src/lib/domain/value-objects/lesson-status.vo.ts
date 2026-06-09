export type LessonStatusType = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export class LessonStatusVO {
  constructor(public readonly value: LessonStatusType) {
    if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(value)) {
      throw new Error(`Invalid lesson status: ${value}`);
    }
  }

  public isPublished(): boolean {
    return this.value === 'PUBLISHED';
  }
}