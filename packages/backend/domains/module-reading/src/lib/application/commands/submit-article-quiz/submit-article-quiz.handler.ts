import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { SubmitArticleQuizCommand } from './submit-article-quiz.command';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { READING_REPOSITORY } from '../../../domain/repositories/reading.repository.interface';
import type { IReadingRepository } from '../../../domain/repositories/reading.repository.interface';
import { READING_QUIZ_SERVICE } from '../../../domain/services/reading-quiz.service.interface';
import type { IReadingQuizService } from '../../../domain/services/reading-quiz.service.interface';
import { ReadingQuizSubmittedEvent } from '../../../domain/events/reading-quiz-submitted.event';

@CommandHandler(SubmitArticleQuizCommand)
export class SubmitArticleQuizCommandHandler implements ICommandHandler<SubmitArticleQuizCommand> {
  private readonly logger = new Logger(SubmitArticleQuizCommandHandler.name);

  constructor(
    @Inject(READING_REPOSITORY)
    private readonly repository: IReadingRepository,
    @Inject(READING_QUIZ_SERVICE)
    private readonly quizService: IReadingQuizService,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: SubmitArticleQuizCommand) {
    const { articleId, answers } = command;

    const article = await this.repository.findArticleById(articleId);
    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }

    const questions = this.quizService.getQuizForArticle(
      article.getTitle(),
      article.getCategory(),
      article.getDifficulty().getValue()
    );

    let correctCount = 0;
    const results = questions.map((q) => {
      const userAnswer = answers[q.id] || '';
      const isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
      if (isCorrect) {
        correctCount++;
      }
      return {
        questionId: q.id,
        question: q.question,
        userAnswer,
        correctAnswer: q.answer,
        isCorrect,
        explanation: q.explanation
      };
    });

    const totalQuestions = questions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Publish quiz submitted event asynchronously
    setImmediate(async () => {
      try {
        await this.eventBus.publish(
          new ReadingQuizSubmittedEvent(
            command.userId,
            articleId,
            score,
            correctCount,
            totalQuestions
          )
        );
      } catch (error) {
        this.logger.error('Failed to publish reading quiz submission event', error);
      }
    });

    return {
      id: articleId,
      articleId,
      score,
      totalQuestions,
      correctCount,
      results
    };
  }
}
