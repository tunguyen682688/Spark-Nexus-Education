import { v4 as uuidv4 } from 'uuid';

export interface UserGrammarTrapProps {
  id?: string;
  userId: string;
  questionId: string;
  questionText: string;
  questionType: string; // MULTIPLE_CHOICE, SENTENCE_BUILDER, ERROR_SPOTLIGHT
  questionData: any; // Options, words, sentence, etc.
  category: string; // syntax, tenses, morphology, modality
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  aiAnalysis?: string | null;
  status?: 'TRAPPED' | 'BROKEN';
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserGrammarTrapEntity {
  public readonly id: string;
  public readonly userId: string;
  public readonly questionId: string;
  public questionText: string;
  public questionType: string;
  public questionData: any;
  public category: string;
  public userAnswer: string;
  public correctAnswer: string;
  public explanation: string;
  public aiAnalysis: string | null;
  public status: 'TRAPPED' | 'BROKEN';
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: UserGrammarTrapProps) {
    this.id = props.id || uuidv4();
    this.userId = props.userId;
    this.questionId = props.questionId;
    this.questionText = props.questionText;
    this.questionType = props.questionType;
    this.questionData = props.questionData;
    this.category = props.category;
    this.userAnswer = props.userAnswer;
    this.correctAnswer = props.correctAnswer;
    this.explanation = props.explanation;
    this.aiAnalysis = props.aiAnalysis || null;
    this.status = props.status || 'TRAPPED';
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public breakTrap(): void {
    this.status = 'BROKEN';
    this.touchUpdate();
  }

  public updateAiAnalysis(analysis: string): void {
    this.aiAnalysis = analysis;
    this.touchUpdate();
  }

  private touchUpdate(): void {
    this.updatedAt = new Date();
  }
}
export { UserGrammarTrapEntity as GrammarTrapEntity };