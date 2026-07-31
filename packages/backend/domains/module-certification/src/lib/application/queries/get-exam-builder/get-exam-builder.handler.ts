import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetExamBuilderQuery, ExamBuilderResult } from './get-exam-builder.query';

@QueryHandler(GetExamBuilderQuery)
export class GetExamBuilderQueryHandler implements IQueryHandler<GetExamBuilderQuery, ExamBuilderResult> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetExamBuilderQuery): Promise<ExamBuilderResult> {
    const exam = await this.repository.findExamById(query.examId);
    if (!exam) {
      throw new NotFoundException(`Exam "${query.examId}" not found`);
    }

    const sections = await this.repository.findSectionsByExamId(query.examId);
    const examQuestions = await this.repository.findQuestionsByExamId(query.examId);

    // Build sections with their questions (distribute evenly)
    const allQuestions = examQuestions.map((eq, idx) => ({
      id: eq.getQuestionId(),
      number: idx + 1,
      title: `Question ${idx + 1}`,
      partTag: 'General',
      type: 'Single Choice' as const,
      difficulty: 'Medium' as const,
      points: eq.getPoints(),
      imageUrl: null as string | null,
    }));

    const sectionData = sections.map((section, sIdx) => {
      const questionsPerSection = Math.ceil(allQuestions.length / sections.length);
      const startIdx = sIdx * questionsPerSection;
      const sectionQuestions = allQuestions.slice(startIdx, startIdx + questionsPerSection);

      return {
        id: section.id,
        number: section.getOrder(),
        title: section.getTitle(),
        subtitle: section.getInstruction() || '',
        questionCount: sectionQuestions.length,
        durationMinutes: Math.round(exam.getDuration() / Math.max(sections.length, 1)),
        isBreak: section.getTitle().toLowerCase().includes('break'),
        questions: sectionQuestions,
      };
    });

    // If no sections exist, create default sections
    if (sectionData.length === 0) {
      const totalQ = exam.getTotalQuestions();
      const listeningQ = Math.round(totalQ * 0.5);
      const readingQ = totalQ - listeningQ;

      sectionData.push(
        {
          id: `${exam.id}-sec-listening`,
          number: 1,
          title: 'Listening',
          subtitle: 'Part 1 - 4',
          questionCount: listeningQ,
          durationMinutes: Math.round(exam.getDuration() * 0.45),
          isBreak: false,
          questions: [],
        },
        {
          id: `${exam.id}-sec-reading`,
          number: 2,
          title: 'Reading',
          subtitle: 'Part 5 - 7',
          questionCount: readingQ,
          durationMinutes: Math.round(exam.getDuration() * 0.55),
          isBreak: false,
          questions: [],
        }
      );
    }

    const totalQuestions = sectionData.reduce((sum, s) => sum + s.questionCount, 0);
    const totalTime = sectionData.reduce((sum, s) => sum + s.durationMinutes, 0);

    return {
      id: exam.id,
      status: exam.getPublishStatus() === 'published' ? 'Published' : 'Draft',
      lastAutosaved: 'All changes saved',
      settings: {
        title: exam.getTitle(),
        description: exam.getDescription() || '',
        level: 'Intermediate',
        language: 'English',
        passingScore: exam.getPassScore(),
        maxScore: exam.getMaxScore(),
        createdDate: exam.createdAt.toLocaleString(),
        lastUpdatedDate: exam.updatedAt.toLocaleString(),
      },
      sections: sectionData,
      blueprint: {
        totalQuestions,
        totalTimeMinutes: totalTime,
        totalPoints: totalQuestions,
      },
    };
  }
}
