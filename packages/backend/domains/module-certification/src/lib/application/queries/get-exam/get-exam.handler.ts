import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetExamQuery } from './get-exam.query';

@QueryHandler(GetExamQuery)
export class GetExamQueryHandler implements IQueryHandler<GetExamQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetExamQuery): Promise<Record<string, unknown>> {
    const exam = await this.repository.findExamById(query.id);
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${query.id} not found`);
    }

    const [sections, examQuestions] = await Promise.all([
      this.repository.findSectionsByExamId(query.id),
      this.repository.findExamQuestionsByExamId(query.id),
    ]);

    const questionsWithDetails = await Promise.all(
      examQuestions.map(async (examQuestion) => {
        const questionId = examQuestion.getQuestionId();
        const [question, choices, metadata] = await Promise.all([
          this.repository.findQuestionById(questionId),
          this.repository.findChoicesByQuestionId(questionId),
          this.repository.findMetadataByQuestionId(questionId),
        ]);

        const hints = (metadata?.getHints() as Array<{ content: string; order: number }> | null) ?? [];
        const media = (metadata?.getMedia() as Array<{ url: string; type: string }> | null) ?? [];

        return {
          id: examQuestion.id,
          questionId,
          order: examQuestion.getOrder(),
          points: examQuestion.getPoints(),
          title: question?.getTitle() ?? '',
          content: question?.getContent() ?? '',
          questionType: question?.getType() ?? 'single_choice',
          choices: choices.map((choice) => ({
            id: choice.id,
            content: choice.getContent(),
            order: choice.getOrder(),
          })),
          hints: hints.map((hint) => ({
            content: hint.content,
            order: hint.order,
          })),
          media: media.map((mediaItem) => ({
            mediaType: mediaItem.type,
            url: mediaItem.url,
          })),
        };
      })
    );

    questionsWithDetails.sort((a, b) => a.order - b.order);

    return {
      ...exam.toPlainObject(),
      sections: sections.map((section) => section.toPlainObject()),
      questions: questionsWithDetails,
    };
  }
}

export { GetExamQueryHandler as GetExamHandler };
