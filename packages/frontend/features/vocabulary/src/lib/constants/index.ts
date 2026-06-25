/**
 * Vocabulary Feature Constants
 * 
 * Centralized constants for the vocabulary feature module
 */

export const VOCABULARY_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // Search
  SEARCH_DEBOUNCE_MS: 500,
  
  // Cache/Stale Time (in milliseconds)
  STALE_TIME: {
    COMMUNITY: 3 * 60 * 1000, // 3 minutes
    DETAIL: 5 * 60 * 1000, // 5 minutes
    WORDS: 2 * 60 * 1000, // 2 minutes
    MY_SETS: 2 * 60 * 1000, // 2 minutes
    MY_FAVORITES: 2 * 60 * 1000, // 2 minutes
  },
  
  // Default sort options
  DEFAULT_SORT: {
    FIELD: 'createdAt',
    DIRECTION: 'desc' as const,
  },
  
  // Learning stats labels
  STATS_LABELS: {
    WORDS_MASTERED: 'Từ đã thuộc',
    CURRENTLY_LEARNING: 'Đang học',
    VOCABULARY_SETS: 'Bộ từ vựng',
    SAVED_WORDS: 'Từ đã lưu',
  },
} as const;

export const VOCABULARY_CATEGORIES = [
  'All',
  'TOEIC',
  'IELTS',
  'TOEFL',
  'ACADEMIC',
  'Business',
  'Travel',
  'Conversation',
  'General',
] as const;

// Overview Learning – text labels
export const OVERVIEW_LEARNING_TEXT = {
  TITLE: 'Tổng quan học từ vựng',
  SET_PREFIX: 'Bộ từ vựng',
  MASTERY_SECTION_TITLE: 'Cấp độ nhớ',
  Y_AXIS_LABEL: 'Số từ đã học',
  BAR_SERIES_NAME: 'Số từ',
} as const;

// Default learning tools metadata (labels, route suffix, badge, description)
export const LEARNING_TOOL_CONFIG = [
  {
    key: 'flashcard',
    label: 'Thẻ ghi nhớ',
    description: 'Lật thẻ ôn từ theo SRS',
    routeId: 'flashcards',
    badge: undefined as string | undefined,
  },
  {
    key: 'study',
    label: 'Luyện Quiz',
    description: 'Trắc nghiệm 4 đáp án',
    routeId: 'quiz',
    badge: undefined as string | undefined,
  },
  {
    key: 'test',
    label: 'Kiểm tra',
    description: 'Thi có giới hạn thời gian',
    routeId: 'test',
    badge: 'New' as string | undefined,
  },
  {
    key: 'match',
    label: 'Ghép cặp',
    description: 'Nối từ với nghĩa',
    routeId: 'match',
    badge: 'Soon' as string | undefined,
  },
  {
    key: 'box',
    label: 'Khối hộp',
    description: 'Luyện tập Leitner',
    routeId: 'box',
    badge: 'Beta' as string | undefined,
  },
] as const;

// Words list filter options and labels
export const WORDS_FILTER_CONSTANTS = {
  STATUS_FILTERS: ['All', 'Learning', 'Mastered', 'Not Started'] as const,
  DIFFICULTY_FILTERS: ['All', 'Easy', 'Medium', 'Hard'] as const,
  LABELS: {
    STATUS: 'Trạng thái:',
    DIFFICULTY: 'Độ khó:',
    NOT_STARTED: 'Chưa học',
    LEARNING: 'Đang học',
    REVIEWING: 'Đang ôn',
    MASTERED: 'Đã thuộc',
  },
} as const;

// Generic card text used across vocabulary cards
export const VOCABULARY_CARD_TEXT = {
  BY: 'Tác giả',
  ENTRIES_SUFFIX: 'mục',
  WORDS_SUFFIX: 'từ vựng',
  NO_DESCRIPTION: 'Không có mô tả',
  VIEW: 'Xem',
  VIEW_DETAILS: 'Xem chi tiết',
  CONTINUE: 'Tiếp tục',
  LAST_STUDIED_PREFIX: 'Học lần cuối:',
  PROGRESS_LABEL: 'Tiến độ',
  GENERAL_TAG: 'Chung',
  ADD: 'Thêm',
} as const;

// Detail vocabulary set – progress & study options text
export const DETAIL_SET_TEXT = {
  PROGRESS_CARD: {
    TITLE: 'Tiến độ của bạn',
    COMPLETED_LABEL: 'Đã hoàn thành',
    MASTERED_LABEL: 'Đã thuộc',
    LEARNING_LABEL: 'Đang học',
    NOT_STARTED_LABEL: 'Chưa học',
  },
  STUDY_OPTIONS: {
    TITLE: 'Tùy chọn học tập',
    PRACTICE_ALL: 'Luyện tập tất cả',
    PRACTICE_DIFFICULT: 'Luyện tập từ khó',
    SPACED_REPETITION: 'Lặp lại ngắt quãng',
    CREATE_FLASHCARDS: 'Tạo thẻ ghi nhớ',
  },
} as const;

// Community vocabulary – headers, filters, tabs
export const COMMUNITY_TEXT = {
  HEADER: {
    TITLE: 'Thư viện Cộng đồng',
    SUBTITLE: 'Khám phá, chia sẻ và học tập từ các bộ từ vựng được tạo bởi cộng đồng',
    SEARCH_PLACEHOLDER: 'Tìm kiếm bộ từ vựng...',
    CATEGORIES_TITLE: 'Danh mục',
    SORT_TITLE: 'Sắp xếp theo',
    SORT_OPTIONS: {
      DATE: 'Ngày tạo',
      NAME: 'Tên',
      WORD_COUNT: 'Số từ',
      POPULARITY: 'Phổ biến',
    },
    CREATE_BUTTON: 'Tạo bộ từ vựng',
    ALL_CATEGORY: 'Tất cả',
  },
  FILTERS: {
    LABEL: 'Bộ lọc:',
    SEARCH_PREFIX: 'Tìm kiếm:',
  },
  TABS: {
    FEATURED: 'Nổi bật',
    RECENT: 'Gần đây',
    POPULAR: 'Phổ biến',
  },
  POPULAR_SECTION: {
    TITLE: 'Bộ từ vựng phổ biến nhất',
    COL_TITLE: 'Tiêu đề',
    COL_CATEGORY: 'Danh mục',
    COL_WORDS: 'Số từ',
    COL_FAVORITES: 'Lượt thích',
    COL_ACTIONS: 'Hành động',
    VIEW_MY_LISTS: 'Xem tất cả bộ từ vựng của tôi',
    POPULAR_TAGS_TITLE: 'Thẻ phổ biến',
    MY_PROGRESS_TITLE: 'Tiến độ học tập của tôi',
  },
  PAGINATION: {
    PREVIOUS: 'Trước',
    NEXT: 'Tiếp',
  },
} as const;

// Community mock data for sidebar (can be replaced with real API later)
export const COMMUNITY_MOCK_DATA = {
  TOP_CONTRIBUTORS: [
    { name: 'Sarah Johnson', sets: 28, followers: 1203 },
    { name: 'Michael Chen', sets: 23, followers: 987 },
    { name: 'Emma Thompson', sets: 17, followers: 756 },
    { name: 'David Wilson', sets: 15, followers: 624 },
  ],
  PROGRESS_EXAMPLES: [
    { title: 'TOEFL Essential Vocabulary', progress: 35 },
    { title: 'Business English Terms', progress: 68 },
    { title: 'Daily Conversation Phrases', progress: 92 },
  ],
} as const;

// My Library – headers, filters, pagination
export const MY_LIBRARY_TEXT = {
  HEADER: {
    TITLE: 'Thư viện của tôi',
    SUBTITLE: 'Quản lý các bộ từ vựng và theo dõi tiến độ học tập của bạn',
    COMMUNITY_BUTTON: 'Danh sách cộng đồng',
    CREATE_BUTTON: 'Tạo bộ từ vựng mới',
  },
  FILTERS: {
    SEARCH_PLACEHOLDER: 'Tìm kiếm bộ từ vựng...',
    ALL_CATEGORIES: 'Tất cả danh mục',
    SORT_PREFIX: 'Sắp xếp theo:',
    SORT_OPTIONS: {
      RECENT: 'Sử dụng gần đây',
      WORDS: 'Số từ vựng',
      PROGRESS: 'Tiến độ',
    },
  },
  PAGINATION: {
    PREVIOUS: 'Trước',
    NEXT: 'Tiếp',
    PAGE_OF: (current: number, total: number) => `Trang ${current} / ${total}`,
  },
} as const;

// Detail Vocabulary Word Page
export const DETAIL_VOCABULARY_TEXT = {
  HEADER: {
    BACK_BUTTON: 'Quay lại danh sách',
    SAVE_BUTTON: 'Lưu',
    SAVED_BUTTON: 'Đã lưu',
    PRACTICE_BUTTON: 'Luyện tập',
  },
  DEFINITION: {
    TITLE: 'Định nghĩa',
    EXAMPLES_TITLE: 'Ví dụ',
  },
  TABS: {
    ETYMOLOGY: 'Nguồn gốc từ',
    RELATED: 'Từ liên quan',
    NOTES: 'Ghi chú',
  },
  ETYMOLOGY: {
    TITLE: 'Nguồn gốc từ',
    DESCRIPTION: 'Nguồn gốc và lịch sử phát triển của từ này',
  },
  RELATED_WORDS: {
    TITLE: 'Từ liên quan',
    DESCRIPTION: 'Các từ có cùng gốc hoặc liên quan về nghĩa',
  },
  NOTES: {
    TITLE: 'Ghi chú của tôi',
    DESCRIPTION: 'Ghi chú cá nhân của bạn về từ này',
    PLACEHOLDER: 'Thêm ghi chú của bạn vào đây...',
    SAVE_BUTTON: 'Lưu ghi chú',
  },
  SIDEBAR: {
    SYNONYMS_ANTONYMS_TITLE: 'Đồng nghĩa & Trái nghĩa',
    SYNONYMS_TITLE: 'Đồng nghĩa',
    ANTONYMS_TITLE: 'Trái nghĩa',
    DIFFICULTY_TITLE: 'Mức độ khó',
    EXTERNAL_RESOURCES_TITLE: 'Tài nguyên ngoài',
  },
  DIFFICULTY: {
    EASY: 'Dễ',
    MEDIUM: 'Trung bình',
    HARD: 'Khó',
    SUFFIX: 'độ khó',
  },
  EXTERNAL_RESOURCES: {
    MERRIAM_WEBSTER: 'Từ điển Merriam-Webster',
    CAMBRIDGE: 'Từ điển Cambridge',
    THESAURUS: 'Thesaurus.com',
  },
  ERROR: {
    TITLE: 'Lỗi',
    DESCRIPTION: 'Không thể tải dữ liệu từ vựng. Vui lòng thử lại.',
  },
} as const;

export const EXTERNAL_DICTIONARY_URLS = {
  MERRIAM_WEBSTER: (word: string) => `https://www.merriam-webster.com/dictionary/${word.toLowerCase()}`,
  CAMBRIDGE: (word: string) => `https://dictionary.cambridge.org/dictionary/english/${word.toLowerCase()}`,
  THESAURUS: (word: string) => `https://www.thesaurus.com/browse/${word.toLowerCase()}`,
} as const;

export const CATEGORY_LIST = [
  { label: "General Vocabulary", value: "GENERAL" },
  { label: "Academic", value: "ACADEMIC" },
  { label: "Business", value: "BUSINESS" },
  { label: "Technology", value: "TECHNOLOGY" },
  { label: "Medical", value: "MEDICAL" },
  { label: "IELTS", value: "IELTS" },
  { label: "TOEIC", value: "TOEIC" },
  { label: "TOEFL", value: "TOEFL" },
  { label: "Travel", value: "TRAVEL" },
  { label: "Food & Drink", value: "FOOD_AND_DRINK" },
  { label: "Science", value: "SCIENCE" },
  { label: "Arts", value: "ARTS" },
  { label: "Sports", value: "SPORTS" },
  { label: "Entertainment", value: "ENTERTAINMENT" },
  { label: "Social Media", value: "SOCIAL_MEDIA" },
  { label: "Environment", value: "ENVIRONMENT" },
  { label: "Education", value: "EDUCATION" },
  { label: "Daily Conversation", value: "DAILY_CONVERSATION" },
  { label: "Literature", value: "LITERATURE" },
  { label: "Music", value: "MUSIC" },
  { label: "Other", value: "OTHER" },
];


