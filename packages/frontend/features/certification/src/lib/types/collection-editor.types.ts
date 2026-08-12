export interface EditorExam {
  id: string;
  number: number;
  order: number;
  title: string;
  subTitle: string;
  questionsCount: number;
  durationMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Published' | 'Draft';
  iconType: string;
  chapterId?: string;
}

export interface EditorChapter {
  id: string;
  number: number;
  title: string;
  description: string;
  exams: EditorExam[];
}

export interface CollectionDetailsForm {
  title: string;
  subtitle: string;
  description: string;
  level: string;
  tags: string[];
  visibility: 'Public' | 'Private';
  allowDownloads: boolean;
  coverImage: string;
  createdDate: string;
  lastUpdatedDate: string;
}

/** Trạng thái đồng bộ — bao gồm cả retry để giữ UI nhất quán */
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'retrying';

/** Config khi thêm exam mới từ modal */
export interface AddExamConfig {
  title: string;
  certificationType: string;
  examType: string;
  duration: number;
  totalQuestions: number;
  maxScore: number;
  passScore: number;
  sections: Array<{ title: string; sectionType: string; instruction?: string; durationMinutes?: number }>;
}

// ===== Summary types =====

export interface EditorSummary {
  totalChapters: number;
  totalExams: number;
  totalQuestions: number;
  estimatedDurationText: string;
  difficultyMix: { easy: number; medium: number; hard: number };
}

// ===== LocalStorage draft types =====

export interface LocalDraft {
  collectionId: string;
  details: CollectionDetailsForm;
  chapters: EditorChapter[];
  savedAt: number;
}
