import { IQuery } from '@nestjs/cqrs';

export class GetArticleQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly userId?: string
  ) {}
}
