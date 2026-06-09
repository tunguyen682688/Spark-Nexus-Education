export class ProficiencyScoreVO {
  constructor(public readonly value: number) {
    if (value < 0 || value > 100) {
      throw new Error('Proficiency score must be between 0 and 100');
    }
  }

  public isPassing(threshold = 70): boolean {
    return this.value >= threshold;
  }
  
  public calculateNextLevel(current: ProficiencyScoreVO): number {
    // Logic tính điểm tăng trưởng giả định
    return Math.min(100, current.value + 5); 
  }
}