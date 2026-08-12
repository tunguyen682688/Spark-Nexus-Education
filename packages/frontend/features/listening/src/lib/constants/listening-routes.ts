/**
 * Centered Listening Domain Routes Mappings
 */
export const LISTENING_ROUTES = {
  HUB: '/listening',
  EXPLORE: '/listening/explore',
  LIBRARY: '/listening/library',
  CONTRIBUTE: '/listening/contribute',
  STUDY: (id: string) => `/listening/study/${id}`,
  WORKSPACE: {
    TRANSCRIPT: (id: string) => `/listening/study/${id}/transcript`,
    DICTATION: (id: string) => `/listening/study/${id}/dictation`,
    GAPFILL: (id: string) => `/listening/study/${id}/gapfill`,
    QUIZ: (id: string) => `/listening/study/${id}/quiz`,
    SHADOWING: (id: string) => `/listening/study/${id}/shadowing`,
  },
};
