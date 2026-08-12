import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetCollectionEditorQuery, CollectionEditorResult } from './get-collection-editor.query';

@QueryHandler(GetCollectionEditorQuery)
export class GetCollectionEditorQueryHandler implements IQueryHandler<GetCollectionEditorQuery, CollectionEditorResult> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetCollectionEditorQuery): Promise<CollectionEditorResult> {
    const collection = await this.repository.findCollectionById(query.collectionId);
    if (!collection) {
      throw new NotFoundException(`Collection "${query.collectionId}" not found`);
    }

    const exams = await this.repository.findExamsByCollectionId(query.collectionId);
    const persistedChapters = await this.repository.findChaptersByCollectionId(query.collectionId);

    const chapters: Array<{
      id: string;
      number: number;
      title: string;
      description: string;
      examCount: number;
      exams: Array<{
        id: string;
        number: number;
        title: string;
        subTitle: string;
        questionsCount: number;
        durationMinutes: number;
        difficulty: string;
        status: string;
        iconType: string;
      }>;
    }> = [];

    if (persistedChapters.length > 0) {
      const examByChapterMap = new Map<string, typeof exams>();
      const orphans: typeof exams = [];

      for (const exam of exams) {
        const plainExam = exam.toPlainObject() as { chapterId?: string | null };
        const chapterId = plainExam.chapterId;
        if (chapterId) {
          const arr = examByChapterMap.get(chapterId) || [];
          arr.push(exam);
          examByChapterMap.set(chapterId, arr);
        } else {
          orphans.push(exam);
        }
      }

      for (const ch of persistedChapters) {
        const chapterExams = examByChapterMap.get(ch.id) || [];
        chapters.push({
          id: ch.id,
          number: ch.getOrder(),
          title: ch.getTitle(),
          description: ch.getDescription() || '',
          examCount: chapterExams.length,
          exams: chapterExams.map((exam, idx) => ({
            id: exam.id,
            number: idx + 1,
            title: exam.getTitle(),
            subTitle: exam.getDescription() || `Section ${idx + 1}`,
            questionsCount: exam.getTotalQuestions(),
            durationMinutes: exam.getDuration(),
            difficulty: inferDifficulty(exam),
            status: exam.getPublishStatus() === 'published' ? 'Published' : 'Draft',
            iconType: inferIconType(collection.getTitle()),
          })),
        });
      }

      if (orphans.length > 0) {
        const lastNum = chapters.length > 0 ? Math.max(...chapters.map((c) => c.number)) + 1 : 1;
        chapters.push({
          id: `orphans-${query.collectionId}`,
          number: lastNum,
          title: `Part ${lastNum}: Unsorted Exams`,
          description: 'Exams not yet assigned to a chapter.',
          examCount: orphans.length,
          exams: orphans.map((exam, idx) => ({
            id: exam.id,
            number: idx + 1,
            title: exam.getTitle(),
            subTitle: exam.getDescription() || `Section ${idx + 1}`,
            questionsCount: exam.getTotalQuestions(),
            durationMinutes: exam.getDuration(),
            difficulty: inferDifficulty(exam),
            status: exam.getPublishStatus() === 'published' ? 'Published' : 'Draft',
            iconType: inferIconType(collection.getTitle()),
          })),
        });
      }
    } else {
      // No persisted chapters — place orphan exams into a single synthetic chapter
      if (exams.length > 0) {
        chapters.push({
          id: `orphans-${query.collectionId}`,
          number: 1,
          title: 'Unsorted Exams',
          description: 'Exams not yet assigned to a chapter.',
          examCount: exams.length,
          exams: exams.map((exam, idx) => ({
            id: exam.id,
            number: idx + 1,
            title: exam.getTitle(),
            subTitle: exam.getDescription() || `Section ${idx + 1}`,
            questionsCount: exam.getTotalQuestions(),
            durationMinutes: exam.getDuration(),
            difficulty: inferDifficulty(exam),
            status: exam.getPublishStatus() === 'published' ? 'Published' : 'Draft',
            iconType: inferIconType(collection.getTitle()),
          })),
        });
      }
      // Empty chapters array if no exams either — frontend handles empty state
    }

    const totalQuestions = exams.reduce((sum, e) => sum + e.getTotalQuestions(), 0);
    const totalMinutes = exams.reduce((sum, e) => sum + e.getDuration(), 0);

    return {
      id: collection.id,
      status: collection.getPublishStatus() === 'published' ? 'Published' : 'Draft',
      lastAutosaved: 'Just now',
      details: {
        title: collection.getTitle(),
        subtitle: collection.getSubtitle() || '',
        description: collection.getDescription() || '',
        level: collection.getLevel() || 'Beginner to Advanced',
        tags: collection.getTags().length > 0 ? collection.getTags() : [inferExamTag(collection.getTitle())],
        visibility: collection.getVisibility() || 'Public',
        allowDownloads: collection.getAllowDownloads() ?? true,
        coverImage: collection.getCoverImage() || '',
        createdDate: collection.createdAt.toLocaleString(),
        lastUpdatedDate: collection.updatedAt.toLocaleString(),
      },
      chapters,
      summary: {
        totalChapters: chapters.length,
        totalExams: exams.length,
        totalQuestions,
        estimatedDurationHours: Math.floor(totalMinutes / 60),
        estimatedDurationMinutes: totalMinutes % 60,
        difficultyMix: {
          easy: Math.round(exams.filter((e) => inferDifficulty(e) === 'Easy').length / Math.max(exams.length, 1) * 100),
          medium: Math.round(exams.filter((e) => inferDifficulty(e) === 'Medium').length / Math.max(exams.length, 1) * 100),
          hard: Math.round(exams.filter((e) => inferDifficulty(e) === 'Hard').length / Math.max(exams.length, 1) * 100),
        },
      },
    };
  }
}


function inferDifficulty(exam: { getPassScore(): number; getMaxScore(): number; getTotalQuestions(): number }): string {
  const ratio = exam.getPassScore() / Math.max(exam.getMaxScore(), 1);
  if (ratio >= 0.7) return 'Hard';
  if (ratio >= 0.5) return 'Medium';
  return 'Easy';
}

function inferIconType(title: string): string {
  const upper = title.toUpperCase();
  if (upper.includes('TOEIC')) return 'toeic';
  if (upper.includes('IELTS')) return 'ielts';
  if (upper.includes('LISTENING')) return 'headphones';
  if (upper.includes('READING')) return 'document';
  if (upper.includes('GRAMMAR')) return 'edit';
  return 'default';
}

function inferExamTag(title: string): string {
  const upper = title.toUpperCase();
  if (upper.includes('TOEIC')) return 'TOEIC';
  if (upper.includes('IELTS')) return 'IELTS';
  if (upper.includes('TOEFL')) return 'TOEFL';
  return 'General';
}
