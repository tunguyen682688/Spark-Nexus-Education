import { Query } from '@nestjs/cqrs';

export interface CollectionEditorResult {
  id: string;
  status: string;
  lastAutosaved: string;
  details: {
    title: string;
    subtitle: string;
    description: string;
    level: string;
    tags: string[];
    visibility: string;
    allowDownloads: boolean;
    coverImage: string;
    createdDate: string;
    lastUpdatedDate: string;
  };
  chapters: Array<{
    id: string;
    number: number;
    title: string;
    description: string;
    examCount: number;
    exams: Array<{
      id: string;
      number: number;
      title: string;
      subTitle: string;
      questionsCount: number;
      durationMinutes: number;
      difficulty: string;
      status: string;
      iconType: string;
    }>;
  }>;
  summary: {
    totalChapters: number;
    totalExams: number;
    totalQuestions: number;
    estimatedDurationHours: number;
    estimatedDurationMinutes: number;
    difficultyMix: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
}

export class GetCollectionEditorQuery extends Query<CollectionEditorResult> {
  constructor(
    public readonly collectionId: string,
    public readonly userId: string
  ) {
    super();
  }
}
