// ===== Pure helper functions — không có React hooks, không side effects =====

import type { EditorExam, EditorChapter, CollectionDetailsForm } from './collection-editor.types';
import { EMPTY_DETAILS } from './collection-editor.types';

/** Tạo UUID v4 */
export function generateId(): string {
  return crypto.randomUUID();
}

/** Retry với exponential backoff — gọi lại fn nếu thất bại */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 1000,
  onRetry?: (attempt: number) => void,
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      onRetry?.(attempt + 1);
      await new Promise((res) => setTimeout(res, delayMs * 2 ** attempt));
    }
  }
  throw new Error('withRetry: unreachable');
}

// ===== Parse API response → local state =====

function mapApiExamToEditorExam(apiExam: Record<string, unknown>, idx: number): EditorExam {
  return {
    id: (apiExam.id as string) ?? `exam-${idx}`,
    number: idx + 1,
    order: (apiExam.order as number) ?? idx,
    title: (apiExam.title as string) ?? `Exam ${idx + 1}`,
    subTitle: (apiExam.description as string) ?? '',
    questionsCount: (apiExam.totalQuestions as number) ?? 0,
    durationMinutes: (apiExam.durationMinutes as number) ?? 0,
    difficulty: 'Medium',
    status: 'Draft',
    iconType: (apiExam.examType as string) ?? 'general',
    chapterId: (apiExam.chapterId as string) ?? undefined,
  };
}

/** Parse dữ liệu API thành form state + chapters */
export function parseApiDataToState(apiData: unknown): {
  details: CollectionDetailsForm;
  chapters: EditorChapter[];
} {
  const record = apiData as Record<string, unknown> | null;
  if (!record) return { details: EMPTY_DETAILS, chapters: [] };

  const apiDetails = record.details as Record<string, unknown> | undefined;
  const apiChapters = record.chapters as Array<Record<string, unknown>> | undefined;

  const details: CollectionDetailsForm = apiDetails
    ? {
        ...EMPTY_DETAILS,
        title: (apiDetails.title as string) ?? '',
        subtitle: (apiDetails.subtitle as string) ?? '',
        description: (apiDetails.description as string) ?? '',
        level: (apiDetails.level as string) ?? 'Beginner',
        tags: Array.isArray(apiDetails.tags) ? (apiDetails.tags as string[]) : [],
        visibility: (apiDetails.visibility as 'Public' | 'Private') ?? 'Public',
        allowDownloads: apiDetails.allowDownloads !== false,
        coverImage: (apiDetails.coverImage as string) ?? '',
        createdDate: (apiDetails.createdDate as string) ?? '',
        lastUpdatedDate: (apiDetails.lastUpdatedDate as string) ?? '',
      }
    : EMPTY_DETAILS;

  const chapters: EditorChapter[] = apiChapters
    ? apiChapters.map((ch, chIdx) => {
        const exams = Array.isArray(ch.exams) ? ch.exams : [];
        return {
          id: (ch.id as string) ?? `chap-${chIdx}`,
          number: (ch.number as number) ?? chIdx + 1,
          title: (ch.title as string) ?? `Part ${chIdx + 1}`,
          description: (ch.description as string) ?? '',
          exams: exams.map((ex, exIdx) => mapApiExamToEditorExam(ex as Record<string, unknown>, exIdx)),
        };
      })
    : [];

  return { details, chapters };
}

// ===== Compute helpers =====

/** Tính phần trăm difficulty mix từ danh sách chapters */
export function computeDifficultyMix(chapters: EditorChapter[]): { easy: number; medium: number; hard: number } {
  let total = 0;
  let easy = 0;
  let medium = 0;
  let hard = 0;
  chapters.forEach((ch) =>
    ch.exams.forEach((ex) => {
      total++;
      if (ex.difficulty === 'Easy') easy++;
      else if (ex.difficulty === 'Medium') medium++;
      else hard++;
    }),
  );
  if (total === 0) return { easy: 0, medium: 0, hard: 0 };
  return {
    easy: Math.round((easy / total) * 100),
    medium: Math.round((medium / total) * 100),
    hard: Math.round((hard / total) * 100),
  };
}

// ===== Payload builders =====

/** Build chapter payload cho syncChapters API — bao gồm exam ordering */
export function buildChapterPayload(chapters: EditorChapter[]) {
  return chapters.map((ch, idx) => ({
    id: ch.id,
    title: ch.title,
    description: ch.description || null,
    order: idx + 1,
    examIds: ch.exams.map((ex) => ex.id),
  }));
}

/** Build details payload cho updateCollection API */
export function buildCollectionDetailsPayload(details: CollectionDetailsForm) {
  return {
    title: details.title,
    description: details.description,
    subtitle: details.subtitle,
    level: details.level,
    tags: details.tags,
    visibility: details.visibility,
    allowDownloads: details.allowDownloads,
    coverImage: details.coverImage,
  };
}

// ===== UI formatters =====

/** Format text hiển thị "Đã lưu trước Xs" / "Đã lưu trước Xm" */
export function formatAutosaveText(lastSavedAt: Date | null, syncStatus: string): string {
  if (syncStatus === 'syncing') return 'Đang lưu...';
  if (syncStatus === 'error') return 'Lỗi đồng bộ';
  if (!lastSavedAt) return 'Chưa lưu';
  const diffMs = Date.now() - lastSavedAt.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `Đã lưu trước ${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  return `Đã lưu trước ${diffMin}m`;
}
