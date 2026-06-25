import { DifficultyVO, CefrLevel } from './difficulty.vo';

describe('DifficultyVO', () => {
  describe('create()', () => {
    it('should create a DifficultyVO for each valid CEFR level', () => {
      const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      for (const level of validLevels) {
        const vo = DifficultyVO.create(level);
        expect(vo.getValue()).toBe(level);
      }
    });

    it('should accept lowercase input and normalise to uppercase', () => {
      const vo = DifficultyVO.create('b2');
      expect(vo.getValue()).toBe(CefrLevel.B2);
    });

    it('should throw for an invalid CEFR level', () => {
      expect(() => DifficultyVO.create('D1')).toThrow();
      expect(() => DifficultyVO.create('')).toThrow();
      expect(() => DifficultyVO.create('EASY')).toThrow();
    });
  });

  describe('equals()', () => {
    it('should return true for two VOs with the same level', () => {
      const a = DifficultyVO.create('B2');
      const b = DifficultyVO.create('B2');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for two VOs with different levels', () => {
      const a = DifficultyVO.create('B1');
      const b = DifficultyVO.create('C1');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('toString()', () => {
    it('should return the CEFR level string', () => {
      const vo = DifficultyVO.create('A1');
      expect(vo.toString()).toBe('A1');
    });
  });
});
