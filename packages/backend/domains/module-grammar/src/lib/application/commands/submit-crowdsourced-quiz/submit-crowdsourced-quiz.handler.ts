import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubmitCrowdsourcedQuizCommand } from './submit-crowdsourced-quiz.command';
import { Inject } from '@nestjs/common';
import { GRAMMAR_COMMUNITY_REPOSITORY } from '../../../domain/repositories/grammar-community.repository.interface';
import type { IGrammarCommunityRepository } from '../../../domain/repositories/grammar-community.repository.interface';
import { GRAMMAR_STREAK_REPOSITORY } from '../../../domain/repositories/grammar-streak.repository.interface';
import type { IGrammarStreakRepository } from '../../../domain/repositories/grammar-streak.repository.interface';

@CommandHandler(SubmitCrowdsourcedQuizCommand)
export class SubmitCrowdsourcedQuizHandler implements ICommandHandler<SubmitCrowdsourcedQuizCommand, any> {
  constructor(
    @Inject(GRAMMAR_COMMUNITY_REPOSITORY)
    private readonly communityRepository: IGrammarCommunityRepository,
    @Inject(GRAMMAR_STREAK_REPOSITORY)
    private readonly streakRepository: IGrammarStreakRepository
  ) {}

  async execute(command: SubmitCrowdsourcedQuizCommand): Promise<any> {
    const { userId, lessonId, dto } = command;

    const bannedWords = ['badword', 'spam', 'tuc tiu', 'fake', 'hacker'];
    const textToCheck = `${dto.explanation} ${JSON.stringify(dto.questionData)}`.toLowerCase();
    const hasBannedWord = bannedWords.some(word => textToCheck.includes(word));
    
    const status = hasBannedWord ? 'REJECTED' : 'PENDING';

    const quiz = await this.communityRepository.createCrowdsourcedQuiz(userId, lessonId, {
      questionType: dto.questionType,
      questionData: dto.questionData,
      explanation: dto.explanation,
      status,
    });

    if (status === 'PENDING') {
      await this.streakRepository.incrementXP(userId, 15);
    }

    return {
      success: true,
      status,
      message: status === 'REJECTED' 
        ? 'Câu hỏi bị từ chối tự động do vi phạm quy tắc kiểm duyệt nội dung.' 
        : 'Đóng góp thành công! Câu hỏi đang ở trạng thái kiểm duyệt cộng đồng.',
      data: quiz,
    };
  }
}
