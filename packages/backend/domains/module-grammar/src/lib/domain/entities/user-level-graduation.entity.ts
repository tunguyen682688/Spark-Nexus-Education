import { v4 as uuidv4 } from 'uuid';

export interface UserLevelGraduationProps {
  id?: string;
  userId: string;
  level: string;
  isPassed?: boolean;
  bestScore: number;
  certificateUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserLevelGraduationEntity {
  public readonly id: string;
  public readonly userId: string;
  public readonly level: string;
  public isPassed: boolean;
  public bestScore: number;
  public certificateUrl: string | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: UserLevelGraduationProps) {
    this.id = props.id || uuidv4();
    this.userId = props.userId;
    this.level = props.level;
    this.isPassed = props.isPassed || false;
    this.bestScore = props.bestScore;
    this.certificateUrl = props.certificateUrl || null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public updateResult(score: number, passed: boolean, certificateUrl?: string | null): void {
    if (score > this.bestScore) {
      this.bestScore = score;
    }
    if (passed) {
      this.isPassed = true;
    }
    if (certificateUrl !== undefined) {
      this.certificateUrl = certificateUrl;
    }
    this.touchUpdate();
  }

  private touchUpdate(): void {
    this.updatedAt = new Date();
  }
}
