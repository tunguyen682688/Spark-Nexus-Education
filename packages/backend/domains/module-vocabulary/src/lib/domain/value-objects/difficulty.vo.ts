/**
 * Value Object: Difficulty (Độ khó)
 * Represents the difficulty level of a vocabulary set
 */
export enum DifficultyLevel {
  BEGINNER = 'beginner',
  ELEMENTARY = 'elementary',
  INTERMEDIATE = 'intermediate',
  UPPER_INTERMEDIATE = 'upper_intermediate',
  ADVANCED = 'advanced',
  PROFICIENT = 'proficient',
}

export class DifficultyVO {
  private constructor(private readonly value: DifficultyLevel) {}

  static create(value: string): DifficultyVO {
    if (!Object.values(DifficultyLevel).includes(value as DifficultyLevel)) {
      throw new Error(
        `Invalid difficulty level: ${value}. Must be one of: ${Object.values(
          DifficultyLevel
        ).join(', ')}`
      );
    }
    return new DifficultyVO(value as DifficultyLevel);
  }

  static createBeginner(): DifficultyVO {
    return new DifficultyVO(DifficultyLevel.BEGINNER);
  }

  static createIntermediate(): DifficultyVO {
    return new DifficultyVO(DifficultyLevel.INTERMEDIATE);
  }

  static createAdvanced(): DifficultyVO {
    return new DifficultyVO(DifficultyLevel.ADVANCED);
  }

  getValue(): DifficultyLevel {
    return this.value;
  }

  equals(other: DifficultyVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  /**
   * Compare difficulty levels
   * @returns positive if this > other, negative if this < other, 0 if equal
   */
  compareTo(other: DifficultyVO): number {
    const levels = Object.values(DifficultyLevel);
    return levels.indexOf(this.value) - levels.indexOf(other.value);
  }

  isHarderThan(other: DifficultyVO): boolean {
    return this.compareTo(other) > 0;
  }

  isEasierThan(other: DifficultyVO): boolean {
    return this.compareTo(other) < 0;
  }
}
