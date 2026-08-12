import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetExamBuilderQuery, ExamBuilderResult } from './get-exam-builder.query';
import { ExamSectionEntity } from '../../../domain/entities/exam-section.entity';

interface SectionDraft {
  number: number;
  title: string;
  subtitle: string;
  sectionType: string;
  questionCount: number;
  durationMinutes: number;
  isBreak: boolean;
}

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

    let sections = await this.repository.findSectionsByExamId(query.examId);

    // If no sections exist, create defaults based on certificationType and persist to DB
    if (sections.length === 0) {
      const certType = exam.getCertificationType();
      const defaults = this.getDefaultSections(certType, exam.id);

      // Persist each default section to DB
      const savedSections: ExamSectionEntity[] = [];
      for (const draft of defaults) {
        const entity = ExamSectionEntity.create({
          id: randomUUID(),
          examId: exam.id,
          title: draft.title,
          subtitle: draft.subtitle,
          sectionType: draft.sectionType,
          order: draft.number,
          durationMinutes: draft.durationMinutes,
          questionCount: draft.questionCount,
          isBreak: draft.isBreak,
        });
        const saved = await this.repository.saveExamSection(entity);
        savedSections.push(saved);
      }

      sections = savedSections;
    }

    // Build sections response from DB entities
    const sectionData = sections.map((section) => ({
      id: section.id,
      number: section.getOrder(),
      title: section.getTitle(),
      subtitle: section.getSubtitle() || section.getInstruction() || section.getSectionType(),
      sectionType: section.getSectionType(),
      questionCount: section.getQuestionCount(),
      durationMinutes: section.getDurationMinutes(),
      isBreak: section.getIsBreak(),
      questions: [], // Empty - loaded on-demand per section
    }));

    const totalQuestions = sectionData.reduce((sum, s) => sum + s.questionCount, 0);
    const totalTime = sectionData.reduce((sum, s) => sum + s.durationMinutes, 0);

    const collection = await this.repository.findCollectionById(exam.getCollectionId());
    const examLevel = exam.getLevel() || collection?.getLevel() || 'Intermediate';
    const collectionId = exam.getCollectionId();
    const collectionTitle = collection?.getTitle() || '';

    return {
      id: exam.id,
      status: exam.getPublishStatus() === 'published' ? 'Published' : 'Draft',
      lastAutosaved: 'All changes saved',
      examType: exam.getExamType(),
      certificationType: exam.getCertificationType(),
      collectionId,
      collectionTitle,
      settings: {
        title: exam.getTitle(),
        description: exam.getDescription() || '',
        level: examLevel,
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

  private getDefaultSections(certType: string | null, examId: string): SectionDraft[] {
    switch (certType) {
      case 'TOEIC':
        return [
          { number: 1, title: 'Part 1: Photographs', subtitle: 'Select the best statement', sectionType: 'listening', questionCount: 10, durationMinutes: 0, isBreak: false },
          { number: 2, title: 'Part 2: Question-Response', subtitle: 'Select the best response', sectionType: 'listening', questionCount: 30, durationMinutes: 0, isBreak: false },
          { number: 3, title: 'Part 3: Conversations', subtitle: 'Listen and answer', sectionType: 'listening', questionCount: 30, durationMinutes: 0, isBreak: false },
          { number: 4, title: 'Part 4: Short Talks', subtitle: 'Listen and answer', sectionType: 'listening', questionCount: 30, durationMinutes: 0, isBreak: false },
          { number: 5, title: 'Part 5: Incomplete Sentences', subtitle: 'Complete the sentence', sectionType: 'reading', questionCount: 40, durationMinutes: 0, isBreak: false },
          { number: 6, title: 'Part 6: Text Completion', subtitle: 'Fill in the blanks', sectionType: 'reading', questionCount: 12, durationMinutes: 0, isBreak: false },
          { number: 7, title: 'Part 7: Reading Comprehension', subtitle: 'Read and answer', sectionType: 'reading', questionCount: 48, durationMinutes: 0, isBreak: false },
        ];
      case 'IELTS':
        return [
          { number: 1, title: 'Section 1: Social Conversations', subtitle: 'Two people in everyday context', sectionType: 'listening', questionCount: 10, durationMinutes: 5, isBreak: false },
          { number: 2, title: 'Section 2: Monologue', subtitle: 'One speaker in everyday context', sectionType: 'listening', questionCount: 10, durationMinutes: 5, isBreak: false },
          { number: 3, title: 'Section 3: Academic Discussion', subtitle: '2-4 people in academic context', sectionType: 'listening', questionCount: 10, durationMinutes: 10, isBreak: false },
          { number: 4, title: 'Section 4: Academic Lecture', subtitle: 'One speaker giving lecture', sectionType: 'listening', questionCount: 10, durationMinutes: 10, isBreak: false },
          { number: 5, title: 'Reading Passage 1', subtitle: 'Academic passage', sectionType: 'reading', questionCount: 13, durationMinutes: 20, isBreak: false },
          { number: 6, title: 'Reading Passage 2', subtitle: 'Academic passage', sectionType: 'reading', questionCount: 13, durationMinutes: 20, isBreak: false },
          { number: 7, title: 'Reading Passage 3', subtitle: 'Academic passage', sectionType: 'reading', questionCount: 14, durationMinutes: 20, isBreak: false },
          { number: 8, title: 'Writing Task 1', subtitle: 'Describe visual data (150+ words)', sectionType: 'writing', questionCount: 1, durationMinutes: 20, isBreak: false },
          { number: 9, title: 'Writing Task 2', subtitle: 'Essay (250+ words)', sectionType: 'writing', questionCount: 1, durationMinutes: 40, isBreak: false },
          { number: 10, title: 'Speaking Part 1', subtitle: 'Introduction & interview', sectionType: 'speaking', questionCount: 4, durationMinutes: 5, isBreak: false },
          { number: 11, title: 'Speaking Part 2', subtitle: 'Long turn / describe topic card', sectionType: 'speaking', questionCount: 1, durationMinutes: 4, isBreak: false },
          { number: 12, title: 'Speaking Part 3', subtitle: 'Discussion', sectionType: 'speaking', questionCount: 4, durationMinutes: 5, isBreak: false },
        ];
      case 'CAMBRIDGE':
        return [
          { number: 1, title: 'Use of English Part 1', subtitle: 'Multiple choice cloze', sectionType: 'reading', questionCount: 8, durationMinutes: 10, isBreak: false },
          { number: 2, title: 'Use of English Part 2', subtitle: 'Open cloze', sectionType: 'reading', questionCount: 8, durationMinutes: 10, isBreak: false },
          { number: 3, title: 'Use of English Part 3', subtitle: 'Word formation', sectionType: 'reading', questionCount: 8, durationMinutes: 10, isBreak: false },
          { number: 4, title: 'Use of English Part 4', subtitle: 'Key word transformations', sectionType: 'reading', questionCount: 6, durationMinutes: 15, isBreak: false },
          { number: 5, title: 'Reading Part 5', subtitle: 'Multiple choice reading', sectionType: 'reading', questionCount: 6, durationMinutes: 15, isBreak: false },
          { number: 6, title: 'Reading Part 6', subtitle: 'Gapped text', sectionType: 'reading', questionCount: 7, durationMinutes: 10, isBreak: false },
          { number: 7, title: 'Reading Part 7', subtitle: 'Multiple matching', sectionType: 'reading', questionCount: 10, durationMinutes: 10, isBreak: false },
          { number: 8, title: 'Writing Part 1', subtitle: 'Compulsory essay', sectionType: 'writing', questionCount: 1, durationMinutes: 40, isBreak: false },
          { number: 9, title: 'Writing Part 2', subtitle: 'Choice of tasks', sectionType: 'writing', questionCount: 1, durationMinutes: 50, isBreak: false },
          { number: 10, title: 'Listening Part 1', subtitle: 'Multiple choice monologues', sectionType: 'listening', questionCount: 6, durationMinutes: 8, isBreak: false },
          { number: 11, title: 'Listening Part 2', subtitle: 'Sentence completion', sectionType: 'listening', questionCount: 9, durationMinutes: 8, isBreak: false },
          { number: 12, title: 'Listening Part 3', subtitle: 'Multiple matching', sectionType: 'listening', questionCount: 5, durationMinutes: 10, isBreak: false },
          { number: 13, title: 'Speaking Part A', subtitle: 'Interview', sectionType: 'speaking', questionCount: 1, durationMinutes: 4, isBreak: false },
          { number: 14, title: 'Speaking Part B', subtitle: 'Long turn', sectionType: 'speaking', questionCount: 1, durationMinutes: 2, isBreak: false },
          { number: 15, title: 'Speaking Part C', subtitle: 'Collaborative task', sectionType: 'speaking', questionCount: 1, durationMinutes: 4, isBreak: false },
          { number: 16, title: 'Speaking Part D', subtitle: 'Further discussion', sectionType: 'speaking', questionCount: 1, durationMinutes: 4, isBreak: false },
        ];
      case 'VSTEP':
        return [
          { number: 1, title: 'Listening Part 1', subtitle: 'Short conversations', sectionType: 'listening', questionCount: 10, durationMinutes: 8, isBreak: false },
          { number: 2, title: 'Listening Part 2', subtitle: 'Long conversations', sectionType: 'listening', questionCount: 10, durationMinutes: 12, isBreak: false },
          { number: 3, title: 'Listening Part 3', subtitle: 'Short talks', sectionType: 'listening', questionCount: 5, durationMinutes: 8, isBreak: false },
          { number: 4, title: 'Listening Part 4', subtitle: 'Lecture / talk', sectionType: 'listening', questionCount: 5, durationMinutes: 8, isBreak: false },
          { number: 5, title: 'Reading Passage 1', subtitle: 'Factual passage', sectionType: 'reading', questionCount: 8, durationMinutes: 20, isBreak: false },
          { number: 6, title: 'Reading Passage 2', subtitle: 'Opinion passage', sectionType: 'reading', questionCount: 8, durationMinutes: 20, isBreak: false },
          { number: 7, title: 'Reading Passage 3', subtitle: 'Argument passage', sectionType: 'reading', questionCount: 9, durationMinutes: 20, isBreak: false },
          { number: 8, title: 'Writing Task 1', subtitle: 'Email / letter', sectionType: 'writing', questionCount: 1, durationMinutes: 30, isBreak: false },
          { number: 9, title: 'Writing Task 2', subtitle: 'Essay', sectionType: 'writing', questionCount: 1, durationMinutes: 30, isBreak: false },
          { number: 10, title: 'Speaking Part 1', subtitle: 'Interview', sectionType: 'speaking', questionCount: 5, durationMinutes: 4, isBreak: false },
          { number: 11, title: 'Speaking Part 2', subtitle: 'Describe picture', sectionType: 'speaking', questionCount: 1, durationMinutes: 4, isBreak: false },
          { number: 12, title: 'Speaking Part 3', subtitle: 'Discussion', sectionType: 'speaking', questionCount: 4, durationMinutes: 4, isBreak: false },
        ];
      case 'TOEFL':
        return [
          { number: 1, title: 'Reading Module', subtitle: '2 passages, 35 minutes', sectionType: 'reading', questionCount: 20, durationMinutes: 35, isBreak: false },
          { number: 2, title: 'Listening Module', subtitle: '3 lectures + 2 conversations, 36 minutes', sectionType: 'listening', questionCount: 28, durationMinutes: 36, isBreak: false },
          { number: 3, title: 'Speaking Task 1', subtitle: 'Independent — personal opinion', sectionType: 'speaking', questionCount: 1, durationMinutes: 2, isBreak: false },
          { number: 4, title: 'Speaking Task 2', subtitle: 'Integrated reading+listening', sectionType: 'speaking', questionCount: 1, durationMinutes: 3, isBreak: false },
          { number: 5, title: 'Speaking Task 3', subtitle: 'Integrated reading+listening', sectionType: 'speaking', questionCount: 1, durationMinutes: 3, isBreak: false },
          { number: 6, title: 'Speaking Task 4', subtitle: 'Integrated lecture only', sectionType: 'speaking', questionCount: 1, durationMinutes: 3, isBreak: false },
          { number: 7, title: 'Writing — Integrated', subtitle: 'Read + listen + summarize', sectionType: 'writing', questionCount: 1, durationMinutes: 20, isBreak: false },
          { number: 8, title: 'Writing — Academic Discussion', subtitle: 'Contribute to discussion', sectionType: 'writing', questionCount: 1, durationMinutes: 10, isBreak: false },
        ];
      case 'SAT':
        return [
          { number: 1, title: 'Reading & Writing — Module 1', subtitle: 'Adaptive: 32 questions, 32 min', sectionType: 'reading', questionCount: 32, durationMinutes: 32, isBreak: false },
          { number: 2, title: 'Reading & Writing — Module 2', subtitle: 'Adaptive: 32 questions, 32 min', sectionType: 'reading', questionCount: 32, durationMinutes: 32, isBreak: false },
          { number: 3, title: 'Math — Module 1', subtitle: 'Adaptive: 22 questions, 35 min', sectionType: 'math', questionCount: 22, durationMinutes: 35, isBreak: false },
          { number: 4, title: 'Math — Module 2', subtitle: 'Adaptive: 22 questions, 35 min', sectionType: 'math', questionCount: 22, durationMinutes: 35, isBreak: false },
        ];
      default: {
        // Generic fallback: Listening + Reading
        const totalQ = 50;
        const listeningQ = Math.round(totalQ * 0.5);
        const readingQ = totalQ - listeningQ;
        return [
          { number: 1, title: 'Listening', subtitle: 'Part 1 - 4', sectionType: 'listening', questionCount: listeningQ, durationMinutes: 45, isBreak: false },
          { number: 2, title: 'Reading', subtitle: 'Part 5 - 7', sectionType: 'reading', questionCount: readingQ, durationMinutes: 55, isBreak: false },
        ];
      }
    }
  }
}
