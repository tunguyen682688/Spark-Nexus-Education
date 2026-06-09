import { v4 as uuidv4 } from 'uuid';
import { GrammarCommunityCommentEntity } from './grammar-community-comment.entity';

export interface GrammarCommunityPostProps {
  id?: string;
  userId: string;
  title: string;
  content: string;
  likesCount?: number;
  tags?: string[];
  hasQuiz?: boolean;
  quizType?: string | null;
  quizData?: unknown;
  createdAt?: Date;
  updatedAt?: Date;
  comments?: GrammarCommunityCommentEntity[];
}

export class GrammarCommunityPostEntity {
  public readonly id: string;
  public readonly userId: string;
  public title: string;
  public content: string;
  public likesCount: number;
  public tags: string[];
  public hasQuiz: boolean;
  public quizType: string | null;
  public quizData: unknown;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public comments: GrammarCommunityCommentEntity[];

  constructor(props: GrammarCommunityPostProps) {
    this.id = props.id || uuidv4();
    this.userId = props.userId;
    this.title = props.title;
    this.content = props.content;
    this.likesCount = props.likesCount || 0;
    this.tags = props.tags || [];
    this.hasQuiz = props.hasQuiz || false;
    this.quizType = props.quizType || null;
    this.quizData = props.quizData || null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
    this.comments = props.comments || [];
  }

  public like(): void {
    this.likesCount += 1;
    this.touchUpdate();
  }

  private touchUpdate(): void {
    this.updatedAt = new Date();
  }
}
