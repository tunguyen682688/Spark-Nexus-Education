import { Command } from '@nestjs/cqrs';
import { UpdateProgressDto } from '../../dtos/grammar-lesson.dtos';

export class UpdateLessonProgressCommand extends Command<any> {
  constructor(
    public readonly lessonId: string,
    public readonly userId: string,
    public readonly dto: UpdateProgressDto
  ) {
    super();
  }
}
