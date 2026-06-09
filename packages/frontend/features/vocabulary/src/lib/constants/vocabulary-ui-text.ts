/**
 * Vocabulary Feature UI Text Constants
 *
 * Centralized localization file for all UI text in the Vocabulary feature.
 * Follows the same pattern as grammar-ui-text.ts
 */

export const VOCABULARY_UI_TEXT = {
  STATS_LEVELS: {
    LEVEL_1: 'Cấp độ 1',
    LEVEL_2: 'Cấp độ 2',
    LEVEL_3: 'Cấp độ 3',
    LEVEL_4: 'Cấp độ 4',
    LONG_TERM: 'Nhớ lâu',
  },
  PRACTICE: {
    TEST: {
      WORD_PREFIX: 'Từ vựng: ',
      FILL_IN_BLANK: 'Điền từ vựng tiếng Anh',
      MATCHING: 'Ghép từ với định nghĩa tương ứng',
      DEFAULT_TITLE: 'Bài kiểm tra',
    },
    QUIZ: {
      DEFAULT_TITLE: 'Luyện Quiz',
    },
    FLASHCARD: {
      NOT_MEMORIZED: 'Chưa thuộc',
    }
  },
  ERRORS: {
    TEST_LOAD_FAILED_TITLE: 'Lỗi tải dữ liệu kiểm tra',
    TEST_LOAD_FAILED_DESC: 'Không thể tải dữ liệu bài kiểm tra.',
    QUIZ_LOAD_FAILED_DESC: 'Không thể tải phiên học trắc nghiệm này.',
    WORDS_LOAD_FAILED_TITLE: 'Lỗi tải từ vựng',
    WORDS_LOAD_FAILED_DESC: 'Có sự cố xảy ra khi lấy danh sách từ. Vui lòng tải lại trang.',
    AUDIO_NOT_SUPPORTED_TITLE: 'Không hỗ trợ âm thanh',
    AUDIO_NOT_SUPPORTED_DESC: 'Trình duyệt của bạn không hỗ trợ Text-to-Speech.',
    RELOAD_PAGE: 'Tải lại trang',
  },
  DATATABLE: {
    HEADERS: {
      WORD: 'Từ vựng',
      MEANING: 'Ý nghĩa',
      STATUS: 'Trạng thái',
      REPETITIONS: 'Số lần lặp',
      NEXT_REVIEW: 'Lần ôn tới',
      ACTIONS: 'Hành động',
    },
    EMPTY_STATE_TITLE: 'Không tìm thấy từ vựng nào',
    EMPTY_STATE_DESC: 'Thử thay đổi bộ lọc tìm kiếm hoặc từ khóa của bạn.',
    LOADING: 'Đang tải danh sách từ vựng...',
    TIME: {
      OVERDUE: 'Quá hạn',
      TODAY: 'Hôm nay',
      TOMORROW: 'Ngày mai',
      IN_DAYS: (days: number) => `Trong ${days} ngày`,
    },
    PAGINATION: {
      SHOWING: (start: number, end: number, total: number) => `Hiển thị ${start} đến ${end} trong tổng số ${total} mục`,
      PREV: 'Trước',
      NEXT: 'Tiếp',
    },
    STATUS: {
      ALL: 'Tất cả',
      MASTERED: 'Đã thuộc',
      LEARNING: 'Đang học',
      NEW: 'Từ mới',
    },
    SORT: {
      ALPHABETICAL: 'Theo Alpha',
      REPETITIONS: 'Lượt ôn tập',
      STATUS: 'Trạng thái',
    },
    ACTIONS: {
      ADD_NEW: 'Thêm từ mới',
      PLAY_AUDIO: 'Phát âm',
      EDIT: 'Sửa từ',
    }
  },
  TOAST_MESSAGES: {
    DELETE_SUCCESS_TITLE: 'Đã xóa bộ từ vựng',
    DELETE_SUCCESS_DESC: 'Bộ từ vựng của bạn đã được xóa thành công.',
    DELETE_FAILED_TITLE: 'Xóa bộ từ vựng thất bại',
    DELETE_FAILED_DESC: 'Không thể xóa bộ từ vựng. Vui lòng thử lại.',
  },
  BUTTONS: {
    BACK: 'Quay lại',
    BACK_TO_OVERVIEW: 'Tổng quan học từ vựng',
  }
} as const;
