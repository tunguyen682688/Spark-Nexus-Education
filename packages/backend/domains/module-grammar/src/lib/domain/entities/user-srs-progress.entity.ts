import { v4 as uuidv4 } from 'uuid';

export interface UserSrsProgressProps {
  id?: string;
  userId: string;
  quizId: string;
  interval?: number;
  easeFactor?: number;
  repetitions?: number;
  dueDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserSrsProgressEntity {
  public readonly id: string;
  public readonly userId: string;
  public readonly quizId: string;
  public interval: number;
  public easeFactor: number;
  public repetitions: number;
  public dueDate: Date;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: UserSrsProgressProps) {
    this.id = props.id || uuidv4();
    this.userId = props.userId;
    this.quizId = props.quizId;
    this.interval = props.interval || 1;
    this.easeFactor = props.easeFactor || 2.5;
    this.repetitions = props.repetitions || 0;
    this.dueDate = props.dueDate;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public submitReview(isCorrect: boolean): void {
    if (isCorrect) {
      if (this.repetitions === 0) {
        this.interval = 1;
      } else if (this.repetitions === 1) {
        this.interval = 3;
      } else {
        this.interval = Math.round(this.interval * this.easeFactor);
      }
      this.repetitions += 1;
      this.easeFactor = this.easeFactor + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02));
    } else {
      this.repetitions = 0;
      this.interval = 1;
      this.easeFactor = Math.max(1.3, this.easeFactor - 0.2);
    }

    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + this.interval);
    this.dueDate = nextDueDate;

    this.touchUpdate();
  }

  private touchUpdate(): void {
    this.updatedAt = new Date();
  }
}
