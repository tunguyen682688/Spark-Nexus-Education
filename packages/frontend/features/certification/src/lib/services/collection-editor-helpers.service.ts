import type { EditorExam, EditorChapter, CollectionDetailsForm, LocalDraft } from '../types/collection-editor.types';
import { EMPTY_DETAILS } from '../constants/collection-editor.constants';

export function generateId(): string {
  return crypto.randomUUID();
}

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

function mapApiExamToEditorExam(apiExam: Record<string, unknown>, chapterId: string): EditorExam {
  const difficultyValue = (apiExam.difficulty as string) ?? 'Medium';
  const statusValue = (apiExam.status as string) ?? 'Draft';
  return {
    id: (apiExam.id as string) ?? '',
    number: (apiExam.number as number) ?? 0,
    order: (apiExam.number as number) ?? 0,
    title: (apiExam.title as string) ?? '',
    subTitle: (apiExam.subTitle as string) ?? '',
    questionsCount: (apiExam.questionsCount as number) ?? 0,
    durationMinutes: (apiExam.durationMinutes as number) ?? 0,
    difficulty: (['Easy', 'Medium', 'Hard'].includes(difficultyValue) ? difficultyValue : 'Medium') as 'Easy' | 'Medium' | 'Hard',
    status: (['Draft', 'Published'].includes(statusValue) ? statusValue : 'Draft') as 'Draft' | 'Published',
    iconType: (apiExam.iconType as string) ?? 'general',
    chapterId,
  };
}

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
    ? apiChapters.map((chapterRecord, chapterIndex) => {
        const chapterId = (chapterRecord.id as string) ?? `chapter-${chapterIndex}`;
        const rawExams = Array.isArray(chapterRecord.exams) ? chapterRecord.exams : [];
        return {
          id: chapterId,
          number: (chapterRecord.number as number) ?? chapterIndex + 1,
          title: (chapterRecord.title as string) ?? `Part ${chapterIndex + 1}`,
          description: (chapterRecord.description as string) ?? '',
          exams: rawExams.map((examRecord) => mapApiExamToEditorExam(examRecord as Record<string, unknown>, chapterId)),
        };
      })
    : [];

  return { details, chapters };
}

export function computeDifficultyMix(chapters: EditorChapter[]): { easy: number; medium: number; hard: number } {
  let total = 0;
  let easy = 0;
  let medium = 0;
  let hard = 0;
  chapters.forEach((chapter) =>
    chapter.exams.forEach((exam) => {
      total++;
      if (exam.difficulty === 'Easy') easy++;
      else if (exam.difficulty === 'Medium') medium++;
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

export function buildChapterPayload(chapters: EditorChapter[]) {
  return chapters.map((chapter, index) => ({
    id: chapter.id,
    title: chapter.title,
    description: chapter.description || null,
    order: index + 1,
    examIds: chapter.exams.map((exam) => exam.id),
  }));
}

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

export function formatAutosaveText(lastSavedAt: Date | null, syncStatus: string): string {
  if (syncStatus === 'syncing') return 'Saving...';
  if (syncStatus === 'error') return 'Sync error';
  if (!lastSavedAt) return 'Not saved';
  const diffMs = Date.now() - lastSavedAt.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `Saved ${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  return `Saved ${diffMin}m ago`;
}

// ===== Snapshot (dirty detection) =====

export function takeSnapshot(
  details: CollectionDetailsForm,
  chapters: EditorChapter[],
): string {
  return JSON.stringify({
    details: {
      title: details.title,
      subtitle: details.subtitle,
      description: details.description,
      level: details.level,
      tags: details.tags,
      visibility: details.visibility,
      allowDownloads: details.allowDownloads,
    },
    chapters: chapters.map((ch) => ({
      id: ch.id,
      title: ch.title,
      description: ch.description,
      examIds: ch.exams.map((e) => e.id),
    })),
  });
}

// ===== Summary computation =====

export function computeSummary(chapters: EditorChapter[]): import('../types/collection-editor.types').EditorSummary {
  let totalExams = 0;
  let totalQuestions = 0;
  let totalMinutes = 0;
  for (const ch of chapters) {
    totalExams += ch.exams.length;
    for (const exam of ch.exams) {
      totalQuestions += exam.questionsCount;
      totalMinutes += exam.durationMinutes;
    }
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return {
    totalChapters: chapters.length,
    totalExams,
    totalQuestions,
    estimatedDurationText: totalMinutes > 0 ? `${hours}h ${mins}m` : '0h 0m',
    difficultyMix: computeDifficultyMix(chapters),
  };
}

// ===== Draft ↔ API merge =====

/**
 * Merge draft chapters with API chapters.
 * Exams are server-authoritative — always prefer API exam data.
 * Draft only contributes chapter metadata (title, description, order).
 * Chapters in draft that don't exist in API are dropped (orphan protection).
 */
export function mergeDraftWithApiChapters(
  draft: LocalDraft,
  apiChapters: EditorChapter[],
): EditorChapter[] {
  const apiById = new Map(apiChapters.map((ch) => [ch.id, ch]));
  return draft.chapters
    .filter((draftCh) => apiById.has(draftCh.id))
    .map((draftCh) => {
      const apiCh = apiById.get(draftCh.id);
      if (!apiCh) return draftCh;
      return {
        ...draftCh,
        exams: apiCh.exams,
        examCount: apiCh.exams.length,
      };
    });
}

// ===== Active chapter resolution =====

/**
 * Resolve the active chapter ID with fallback.
 * Guarantees: returns a valid chapter ID or empty string if no chapters.
 */
export function resolveActiveChapterId(
  chapters: EditorChapter[],
  currentId: string,
): string {
  if (chapters.length === 0) return '';
  if (chapters.some((ch) => ch.id === currentId)) return currentId;
  return chapters[0].id;
}

// ===== ChapterId validation =====

/**
 * Ensure every exam in every chapter has the correct chapterId.
 * Fixes orphans from stale data or migration issues.
 */
export function sanitizeChapterExamIds(chapters: EditorChapter[]): EditorChapter[] {
  return chapters.map((ch) => ({
    ...ch,
    exams: ch.exams.map((ex) => ({
      ...ex,
      chapterId: ch.id,
    })),
  }));
}

// ===== LocalStorage draft CRUD =====

const DRAFT_KEY = 'sne-collection-draft';
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export function saveDraftToStorage(draft: LocalDraft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch { /* quota exceeded or private browsing */ }
}

export function loadDraftFromStorage(collectionId: string): LocalDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalDraft;
    if (parsed.collectionId !== collectionId) return null;
    if (Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    // Validate draft shape
    if (!parsed.details || !Array.isArray(parsed.chapters)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearDraftFromStorage(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch { /* ignore */ }
}
