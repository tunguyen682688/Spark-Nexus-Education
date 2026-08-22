// ─── Certification Query Key Factory ─────────────────────────────────────────
// Centralized query keys to prevent mistyped strings and enable precise invalidation.

const BASE = ['certification'] as const;

export const certificationKeys = {
  all: BASE,

  // Dashboard
  dashboard: () => [...BASE, 'dashboard'] as const,
  creatorDashboard: () => [...BASE, 'creator-dashboard'] as const,
  studyPlan: () => [...BASE, 'study-plan'] as const,
  topContributors: () => [...BASE, 'top-contributors'] as const,

  // Collections
  collections: {
    all: [...BASE, 'collections'] as const,
    featured: (exam: string, search: string, page: number, limit: number) =>
      [...BASE, 'featured', exam, search, page, limit] as const,
    trending: (page: number, limit: number) =>
      [...BASE, 'trending', page, limit] as const,
    official: (page: number, limit: number) =>
      [...BASE, 'official', page, limit] as const,
    community: (page: number, limit: number) =>
      [...BASE, 'community', page, limit] as const,
    detail: (id: string) => [...BASE, 'collection', id] as const,
    items: (id: string) => [...BASE, 'collection-items', id] as const,
    editor: (id: string) => [...BASE, 'collection-editor', id] as const,
    saved: () => [...BASE, 'saved-collections'] as const,
  },

  // Exams
  exams: {
    detail: (id: string) => [...BASE, 'exam', id] as const,
    builder: (id: string) => [...BASE, 'exam-builder', id] as const,
    sectionQuestions: (examId: string, sectionId: string) =>
      [...BASE, 'exam', examId, 'section', sectionId, 'questions'] as const,
  },

  // Exam content editor (for TOEIC content editing)
  examContent: {
    all: [...BASE, 'exam-content'] as const,
    builder: (id: string) => [...BASE, 'exam-content', 'builder', id] as const,
  },

  // Sessions
  sessions: {
    all: [...BASE, 'session'] as const,
    detail: (id: string) => [...BASE, 'session', id] as const,
    result: (id: string) => [...BASE, 'result', id] as const,
  },

  // Reviews
  reviews: {
    all: [...BASE, 'reviews'] as const,
    collection: (id: string) => [...BASE, 'collection-reviews', id] as const,
    activities: (id: string) => [...BASE, 'collection-activities', id] as const,
  },

  // User data
  user: {
    history: () => [...BASE, 'history'] as const,
    completed: () => [...BASE, 'completed'] as const,
    favorites: () => [...BASE, 'favorites'] as const,
    bookmarks: () => [...BASE, 'bookmarks'] as const,
    inProgress: () => [...BASE, 'in-progress'] as const,
    cloned: () => [...BASE, 'cloned'] as const,
    downloads: () => [...BASE, 'downloads'] as const,
    purchased: () => [...BASE, 'purchased'] as const,
    certificates: () => [...BASE, 'user-certificates'] as const,
  },
} as const;
