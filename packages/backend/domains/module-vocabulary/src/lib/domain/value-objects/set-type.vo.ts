/**
 * Value Object: SetType (Loại gói từ vựng)
 * Represents the type of vocabulary set
 */
export enum SetType {
  CUSTOM = 'custom',
  FLASHCARD = 'flashcard',
  QUIZ = 'quiz',
  READING = 'reading',
  LISTENING = 'listening',
  MIXED = 'mixed',
}

export class SetTypeVO {
  private constructor(private readonly value: SetType) {}

  static create(value: string): SetTypeVO {
    if (!Object.values(SetType).includes(value as SetType)) {
      throw new Error(
        `Invalid set type: ${value}. Must be one of: ${Object.values(
          SetType
        ).join(', ')}`
      );
    }
    return new SetTypeVO(value as SetType);
  }

  static createFlashcard(): SetTypeVO {
    return new SetTypeVO(SetType.FLASHCARD);
  }

  static createQuiz(): SetTypeVO {
    return new SetTypeVO(SetType.QUIZ);
  }

  getValue(): SetType {
    return this.value;
  }

  equals(other: SetTypeVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
