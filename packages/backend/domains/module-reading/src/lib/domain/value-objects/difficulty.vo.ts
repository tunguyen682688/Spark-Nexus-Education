export enum CefrLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export class DifficultyVO {
  private constructor(private readonly value: CefrLevel) {}

  static create(value: string): DifficultyVO {
    const upperValue = value.toUpperCase();
    if (!Object.values(CefrLevel).includes(upperValue as CefrLevel)) {
      throw new Error(
        `Invalid CEFR level: ${value}. Must be one of: ${Object.values(
          CefrLevel
        ).join(', ')}`
      );
    }
    return new DifficultyVO(upperValue as CefrLevel);
  }

  getValue(): CefrLevel {
    return this.value;
  }

  equals(other: DifficultyVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
