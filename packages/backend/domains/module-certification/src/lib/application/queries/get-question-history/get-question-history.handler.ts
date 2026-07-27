import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { GetQuestionHistoryQuery } from './get-question-history.query';

export interface QuestionVersionDto {
  id: string;
  questionId: string;
  version: number;
  content: string;
  createdAt: Date;
  createdBy: string | null;
}

@QueryHandler(GetQuestionHistoryQuery)
export class GetQuestionHistoryQueryHandler
  implements IQueryHandler<GetQuestionHistoryQuery, QuestionVersionDto[]>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetQuestionHistoryQuery): Promise<QuestionVersionDto[]> {
    const versions = await this.prisma.questionVersion.findMany({
      where: { questionId: query.questionId },
      orderBy: { version: 'desc' },
    });

    return versions.map((v) => ({
      id: v.id,
      questionId: v.questionId,
      version: v.version,
      content: v.content,
      createdAt: v.createdAt,
      createdBy: v.createdBy,
    }));
  }
}
