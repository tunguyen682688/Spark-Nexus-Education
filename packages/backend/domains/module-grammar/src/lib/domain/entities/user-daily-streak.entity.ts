import { v4 as uuidv4 } from 'uuid';

export interface UserDailyStreakProps {
  id?: string;
  userId: string;
  streakCount?: number;
  lastActiveAt?: Date | null;
  totalXP?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserDailyStreakEntity {
  public readonly id: string;
  public readonly userId: string;
  public streakCount: number;
  public lastActiveAt: Date | null;
  public totalXP: number;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: UserDailyStreakProps) {
    this.id = props.id || uuidv4();
    this.userId = props.userId;
    this.streakCount = props.streakCount || 0;
    this.lastActiveAt = props.lastActiveAt || null;
    this.totalXP = props.totalXP || 0;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public incrementXP(xp: number): void {
    this.totalXP += xp;
    this.touchUpdate();
  }

  public updateStreak(count: number, activeAt: Date): void {
    this.streakCount = count;
    this.lastActiveAt = activeAt;
    this.touchUpdate();
  }

  private touchUpdate(): void {
    this.updatedAt = new Date();
  }
}
