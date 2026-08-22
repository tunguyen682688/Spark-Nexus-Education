import { Query } from '@nestjs/cqrs';

export interface ExamBuilderResult {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  durationMinutes: number;
  passingScore: number;
  status: string;
  lastAutosaved: string;
  examType: string;
  certificationType: string | null;
  collectionId: string;
  collectionTitle: string;
  settings: {
    title: string;
    description: string;
    duration: number;
    passingScore: number;
    maxScore: number;
    difficulty: string;
    level: string;
    language: string;
    instructions: string;
    createdDate: string;
    lastUpdatedDate: string;
  };
  sections: Array<{
    id: string;
    number: number;
    title: string;
    subtitle: string;
    sectionType: string;
    questionCount: number;
    durationMinutes: number;
    isBreak: boolean;
    questions: Array<{
      id: string;
      number: number;
      title: string;
      partTag: string;
      type: string;
      difficulty: string;
      points: number;
      imageUrl: string | null;
    }>;
  }>;
  blueprint: {
    totalQuestions: number;
    totalTimeMinutes: number;
    totalPoints: number;
  };
}

export class GetExamBuilderQuery extends Query<ExamBuilderResult> {
  constructor(
    public readonly examId: string,
    public readonly userId: string
  ) {
    super();
  }
}
