import { v4 as uuidv4 } from 'uuid';

export interface GrammarCrowdsourcedQuizProps {
  id?: string;
  lessonId: string;
  contributorId: string;
  questionType: string;
  questionData: unknown;
  explanation: string;
  status?: string;
  upvotes?: number;
  createdAt?: Date;
}

export class GrammarCrowdsourcedQuizEntity {
  public readonly id: string;
  public readonly lessonId: string;
  public readonly contributorId: string;
  public questionType: string;
  public questionData: unknown;
  public explanation: string;
  public status: string;
  public upvotes: number;
  public readonly createdAt: Date;

  constructor(props: GrammarCrowdsourcedQuizProps) {
    this.id = props.id || uuidv4();
    this.lessonId = props.lessonId;
    this.contributorId = props.contributorId;
    this.questionType = props.questionType;
    this.questionData = props.questionData;
    this.explanation = props.explanation;
    this.status = props.status || 'PENDING';
    this.upvotes = props.upvotes || 0;
    this.createdAt = props.createdAt || new Date();
  }

  public approve(): void {
    this.status = 'APPROVED';
  }

  public reject(): void {
    this.status = 'REJECTED';
  }

  public upvote(): void {
    this.upvotes += 1;
  }
}
