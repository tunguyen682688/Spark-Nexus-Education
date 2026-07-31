import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetQuestionBuilderQuery } from './get-question-builder.query';
import type {
  ICertificationRepository,
} from '../../../domain/repositories/certification.repository.interface';
import { CERTIFICATION_REPOSITORY } from '../../../domain/repositories/certification.repository.interface';

export interface QuestionBuilderResponseDto {
  id: string;
  badgeType: string;
  status: string;
  questionText: string;
  questionType: string;
  difficulty: string;
  shuffleOptions: boolean;
  options: Array<{
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation: string;
  reference: {
    type: string | null;
    passageSource: string | null;
    highlight: string | null;
  };
  properties: {
    id: string;
    points: number;
    estimatedTime: string;
    tags: string[];
    skills: string[];
    cognitiveLevel: string;
    createdDate: string;
    lastUpdatedDate: string;
    createdBy: string;
  };
  qualityScore: {
    score: number;
    rating: string;
    description: string;
    checks: string[];
  };
  usedIn: {
    examTitle: string;
    sectionInfo: string;
  } | null;
}

@QueryHandler(GetQuestionBuilderQuery)
export class GetQuestionBuilderQueryHandler
  implements IQueryHandler<GetQuestionBuilderQuery, QuestionBuilderResponseDto>
{
  constructor(
    @Inject(CERTIFICATION_REPOSITORY)
    private readonly repo: ICertificationRepository
  ) {}

  async execute(query: GetQuestionBuilderQuery): Promise<QuestionBuilderResponseDto> {
    const data = await this.repo.findQuestionWithBuilderData(query.questionId);

    if (!data) {
      throw new NotFoundException(`Question ${query.questionId} not found`);
    }

    const { question, choices, metadata } = data;

    // Map choices to response format with labels
    const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const options = choices.map((c, index) => ({
      id: c.id,
      label: labels[index] || `Option ${index + 1}`,
      text: c.getContent(),
      isCorrect: c.getIsCorrect(),
    }));

    // Calculate quality score
    const quality = metadata?.calculateQualityScore() || {
      score: 0,
      rating: 'Needs Improvement',
      checks: [],
    };

    // Get exam context
    let usedIn: QuestionBuilderResponseDto['usedIn'] = null;
    const examQuestions = await this.repo.findExamQuestionsByQuestionId(query.questionId);
    if (examQuestions.length > 0) {
      const examId = examQuestions[0].getExamId();
      const exam = await this.repo.findExamById(examId);
      if (exam) {
        usedIn = {
          examTitle: exam.getTitle(),
          sectionInfo: 'Main Section',
        };
      }
    }

    return {
      id: question.id,
      badgeType: this.mapQuestionTypeToBadge(question.getType()),
      status: 'All changes saved',
      questionText: question.getContent(),
      questionType: question.getType(),
      difficulty: question.getDifficulty(),
      shuffleOptions: metadata?.getShuffleOptions() || false,
      options,
      explanation: metadata?.getExplanation() || '',
      reference: {
        type: metadata?.getReferenceType() || null,
        passageSource: metadata?.getPassageSource() || null,
        highlight: metadata?.getHighlight() || null,
      },
      properties: {
        id: question.id,
        points: metadata?.getPoints() || 1,
        estimatedTime: metadata?.getEstimatedTime() || '00:00',
        tags: metadata?.getTags() || [],
        skills: metadata?.getSkills() || [],
        cognitiveLevel: metadata?.getCognitiveLevel() || 'Understand',
        createdDate: question.createdAt
          ? new Date(question.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        lastUpdatedDate: question.updatedAt
          ? new Date(question.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        createdBy: question.getCreatedBy() || 'Unknown',
      },
      qualityScore: {
        score: quality.score,
        rating: quality.rating,
        description:
          quality.rating === 'Excellent'
            ? 'This question meets our quality standards.'
            : 'This question needs improvement.',
        checks: quality.checks,
      },
      usedIn,
    };
  }

  private mapQuestionTypeToBadge(type: string): string {
    const map: Record<string, string> = {
      multiple_choice: 'Multiple Choice',
      fill_in_blank: 'Fill in Blank',
      essay: 'Essay',
    };
    return map[type] || type;
  }
}
