import { v4 as uuidv4 } from 'uuid';

export interface GrammarExamSetProps {
  id?: string;
  title: string;
  description: string;
  level: string;
  examType?: string;
  examMetadata?: any;
  creatorId: string;
  creatorName?: string;
  questions: any;
  timeLimit?: number;
  upvotes?: number;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deleted?: boolean;
}

export class GrammarExamSetEntity {
  public readonly id: string;
  public title: string;
  public description: string;
  public level: string;
  public examType: string;
  public examMetadata: any;
  public creatorId: string;
  public creatorName: string;
  public questions: any;
  public timeLimit: number;
  public upvotes: number;
  public status: string;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public deleted: boolean;

  constructor(props: GrammarExamSetProps) {
    this.id = props.id || uuidv4();
    this.title = props.title;
    this.description = props.description;
    this.level = props.level;
    this.examType = props.examType || 'CEFR';
    this.examMetadata = props.examMetadata || {};
    this.creatorId = props.creatorId;
    this.creatorName = props.creatorName || 'Cộng tác viên';
    this.questions = props.questions;
    this.timeLimit = props.timeLimit || 600;
    this.upvotes = props.upvotes || 0;
    this.status = props.status || 'PENDING';
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
    this.deleted = props.deleted || false;
  }

  public upvote(): void {
    this.upvotes += 1;
    this.touchUpdate();
  }

  public approve(): void {
    this.status = 'APPROVED';
    this.touchUpdate();
  }

  private touchUpdate(): void {
    this.updatedAt = new Date();
  }
}
