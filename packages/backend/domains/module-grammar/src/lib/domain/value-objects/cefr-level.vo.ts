export type CefrLevelType = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export class CefrLevelVO {
  private static readonly VALID_LEVELS: CefrLevelType[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  private static readonly ORDER: Record<CefrLevelType, number> = {
    'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6
  };

  constructor(public readonly value: CefrLevelType) {
    if (!CefrLevelVO.VALID_LEVELS.includes(value)) {
      throw new Error(`Invalid CEFR level: ${value}`);
    }
  }

  public isHigherOrEqual(other: CefrLevelVO): boolean {
    return CefrLevelVO.ORDER[this.value] >= CefrLevelVO.ORDER[other.value];
  }

  public toString(): string {
    return this.value;
  }
}