import { v4 as uuidv4 } from 'uuid';

export interface UserExamSetProgressProps {
  id?: string;
  userId: string;
  examSetId: string;
  bestScore: number;
  isPassed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserExamSetProgressEntity {
  public readonly id: string;
  public readonly userId: string;
  public readonly examSetId: string;
  public bestScore: number;
  public isPassed: boolean;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: UserExamSetProgressProps) {
    this.id = props.id || uuidv4();
    this.userId = props.userId;
    this.examSetId = props.examSetId;
    this.bestScore = props.bestScore;
    this.isPassed = props.isPassed || props.bestScore >= 80.0;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public updateScore(score: number): void {
    if (score > this.bestScore) {
      this.bestScore = score;
    }
    if (this.bestScore >= 80.0) {
      this.isPassed = true;
    }
    this.touchUpdate();
  }

  private touchUpdate(): void {
    this.updatedAt = new Date();
  }
}
