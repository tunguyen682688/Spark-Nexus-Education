import { Query } from '@nestjs/cqrs';

export interface ExamBuilderResult {
  id: string;
  status: string;
  lastAutosaved: string;
  settings: {
    title: string;
    description: string;
    level: string;
    language: string;
    passingScore: number;
    maxScore: number;
    createdDate: string;
    lastUpdatedDate: string;
  };
  sections: Array<{
    id: string;
    number: number;
    title: string;
    subtitle: string;
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
