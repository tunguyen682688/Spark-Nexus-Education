import { Command } from '@nestjs/cqrs';
import { UpdateLessonDto } from '../../dtos/grammar-lesson.dtos';

export class UpdateLessonCommand extends Command<any> {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateLessonDto
  ) {
    super();
  }
}
