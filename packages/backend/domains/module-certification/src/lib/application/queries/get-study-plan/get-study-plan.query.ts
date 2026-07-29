import { Query } from '@nestjs/cqrs';

interface StudyPlanDay {
  day: string;
  title: string;
  topic: string;
  duration: string;
  completed: boolean;
}

export class GetStudyPlanQuery extends Query<StudyPlanDay[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
