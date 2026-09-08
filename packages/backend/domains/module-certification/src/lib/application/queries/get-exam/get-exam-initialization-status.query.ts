import { Query } from '@nestjs/cqrs';

export interface InitProgressData {
  questionsCreated: number;
  totalQuestions: number;
  percentage: number;
  currentSection: string;
  status: 'initializing' | 'completed' | 'failed';
  phase?: 'preparing' | 'collecting' | 'inserting' | 'finalizing';
  phaseLabel?: string;
}

export class GetExamInitializationStatusQuery extends Query<{
  id: string;
  initializationStatus: string;
  progress: InitProgressData | null;
}> {
  constructor(public readonly examId: string) {
    super();
  }
}
