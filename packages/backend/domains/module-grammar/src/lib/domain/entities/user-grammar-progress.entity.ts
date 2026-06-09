import { v4 as uuidv4 } from 'uuid';

export interface UserGrammarProgressProps {
  id?: string;
  userId: string;
  lessonId: string;
  status?: 'IN_PROGRESS' | 'MASTERED';
  proficiency?: number;
  quickNotes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserGrammarProgressEntity {
  public readonly id: string;
  public readonly userId: string;
  public readonly lessonId: string;
  public status: 'IN_PROGRESS' | 'MASTERED';
  public proficiency: number;
  public quickNotes: string | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: UserGrammarProgressProps) {
    this.id = props.id || uuidv4();
    this.userId = props.userId;
    this.lessonId = props.lessonId;
    this.status = props.status || 'IN_PROGRESS';
    this.proficiency = props.proficiency || 0;
    this.quickNotes = props.quickNotes || null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  // --- BUSINESS LOGIC CORE ---

  public submitAttempt(newScore: number): void {
    if (newScore > this.proficiency) {
      this.proficiency = newScore;
    }

    if (this.proficiency >= 80) {
      this.complete();
    }
    this.touchUpdate();
  }

  private complete(): void {
    this.status = 'MASTERED';
  }

  public isCompleted(): boolean {
    return this.status === 'MASTERED';
  }

  private touchUpdate(): void {
    this.updatedAt = new Date();
  }
}