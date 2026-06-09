import { v4 as uuidv4 } from 'uuid';

export interface GrammarCommunityCommentProps {
  id?: string;
  postId: string;
  userId: string;
  content: string;
  createdAt?: Date;
}

export class GrammarCommunityCommentEntity {
  public readonly id: string;
  public readonly postId: string;
  public readonly userId: string;
  public content: string;
  public readonly createdAt: Date;

  constructor(props: GrammarCommunityCommentProps) {
    this.id = props.id || uuidv4();
    this.postId = props.postId;
    this.userId = props.userId;
    this.content = props.content;
    this.createdAt = props.createdAt || new Date();
  }
}
