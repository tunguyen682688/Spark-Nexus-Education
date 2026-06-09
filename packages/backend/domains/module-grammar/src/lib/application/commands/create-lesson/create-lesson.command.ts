import { Command } from '@nestjs/cqrs';
import { CreateLessonDto } from '../../dtos/grammar-lesson.dtos';

export class CreateLessonCommand extends Command<any> {
  constructor(public readonly dto: CreateLessonDto) {
    super();
  }
}
