import { Query } from '@nestjs/cqrs';

export interface SectionQuestionsResult {
  questions: Array<{
    id: string;
    examQuestionId: string;
    number: number;
    title: string;
    partTag: string;
    type: string;
    difficulty: string;
    points: number;
    imageUrl: string | null;
    audioUrl: string | null;
    passageId: string | null;
    passageText: string | null;
    modelAnswer: string | null;
    explanation: string | null;
    estimatedTime: number | null;
    metadataPoints: number | null;
    partNumber: number | null;
    passageGroupId: string | null;
    passageType: string | null;
    passageTitle: string | null;
    blankNumber: number | null;
    subQuestionNumber: number | null;
    formatMetadata: unknown | null;
  }>;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class GetSectionQuestionsQuery extends Query<SectionQuestionsResult> {
  constructor(
    public readonly examId: string,
    public readonly sectionId: string,
    public readonly userId: string,
    public readonly page = 1,
    public readonly pageSize = 20,
    public readonly search?: string
  ) {
    super();
  }
}