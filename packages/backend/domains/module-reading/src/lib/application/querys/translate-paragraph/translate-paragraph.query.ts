import { IQuery } from '@nestjs/cqrs';

export class TranslateParagraphQuery implements IQuery {
  constructor(public readonly text: string) {}
}
