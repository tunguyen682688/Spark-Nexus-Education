export const ROUTES = { 
  HOME: '/',
  LOGIN: '/login',
  LIBRARY: '/library',
  DASHBOARD: '/dashboard',
  PLANS: '/plans',
  VOCABULARIES: {
    SET: '/vocabularies/sets',
    COMMUNITY: '/vocabularies/community',
    MY_VOCABULARY_SET: '/vocabularies/my',
    OVERVIEW_DETAIL_SET_VOCABULARY: '/vocabularies/set/:id',
    STATUS_SET_VOCABULARY: '/vocabularies/set/:id/status',
    OVERVIEW_SET_VOCABULARY_LEARNING: '/vocabularies/set/:id/overview/learning',
    DETAIL_SET_VOCABULARY: '/vocabularies/set/:id/detail',
    DETAIL_WORD_VOCABULARY: '/vocabularies/set/:id/word/:wordId',
    DETAIL_ENTRY: '/vocabularies/entry/:entryId',
    CREATE: '/vocabularies/create',
    UPDATE: '/vocabularies/update/:id',
    FLASHCARD: '/vocabularies/set/:id/flashcards',
    QUIZ: '/vocabularies/set/:id/quiz',
    TEST: '/vocabularies/set/:id/test',
  },

  LEARNING: {
    LEARNING_VOCABULARY: '/learning/vocabulary',
    LEARNING_VOCABULARY_DETAIL: '/learning/vocabulary/:id',
    LEARNING_VOCABULARY_DETAIL_EDIT: '/learning/vocabulary/:id/edit',
    LEARNING_VOCABULARY_DETAIL_DELETE: '/learning/vocabulary/:id/delete',
    LEARNING_VOCABULARY_DETAIL_VIEW: '/learning/vocabulary/:id/view',
    LEARNING_VOCABULARY_DETAIL_VIEW_EDIT: '/learning/vocabulary/:id/view/edit',
    LEARNING_VOCABULARY_DETAIL_VIEW_DELETE: '/learning/vocabulary/:id/view/delete',
  },
  
  READING: {
    HUB: '/reading',
    EXPLORE: '/reading/explore',
    ARTICLE: '/reading/article/:articleId',
    NEWS: '/reading/news',
    ACADEMIC: '/reading/academic',
    STUDIO: '/reading/studio',
    STUDIO_EDIT: '/reading/studio/:articleId',
  },
}

export const DEFAULT_ARTICLE_THUMBNAIL = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop';

