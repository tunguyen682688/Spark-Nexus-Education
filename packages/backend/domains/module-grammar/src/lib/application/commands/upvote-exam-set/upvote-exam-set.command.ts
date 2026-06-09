import { Command } from '@nestjs/cqrs';

export class UpvoteExamSetCommand extends Command<any> {
  constructor(public readonly id: string) {
    super();
  }
}
