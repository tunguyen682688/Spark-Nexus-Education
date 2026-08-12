/**
 * Text strings and labels for Listening Workspaces (Transcript, Dictation, GapFill, Quiz, Shadowing)
 */
export const LISTENING_WORKSPACE_TEXT = {
  COMMON: {
    LOADING_GAPFILL: 'Đang tải không gian điền từ...',
    LOADING_DICTATION: 'Đang tải không gian chép chính tả...',
    LOADING_QUIZ: 'Đang tải không gian làm bài tập...',
    LOADING_SHADOWING: 'Đang tải không gian Shadowing...',
    LOADING_TRANSCRIPT: 'Đang tải không gian xem script...',
    ERROR_MATERIAL_TITLE: 'Không thể tải thông tin bài học',
    ERROR_MATERIAL_DESC: 'Vui lòng quay lại bảng điều khiển để thử lại.',
    ERROR_DICTATION_DESC: 'Có lỗi xảy ra trong quá trình truy xuất dữ liệu từ máy chủ.',
    ERROR_QUIZ_TITLE: 'Không thể tải thông tin câu hỏi',
    BACK_TO_DASHBOARD: 'Quay lại bảng điều khiển',
    BACK_TO_HOME: 'Quay lại trang chủ',
    BACK_TO_LIST: 'QUAY LẠI DANH SÁCH BÀI NGHE',
    SPEED_LABEL: (speed: number) => `Speed: ${speed}x`,
    SPEED_TEMPLATE: (speed: number) => `Tốc độ: ${speed}x`,
    SPEED_SAMPLE_LABEL: (speed: number) => `Tốc độ mẫu: ${speed}x`,
    EMPTY_SUBTITLES: 'Không tìm thấy lời thoại cho tài liệu luyện nghe này.',
    EMPTY_QUESTIONS: 'Không tìm thấy câu hỏi ôn tập nào cho tài liệu nghe này.',
    SENTENCE_NUMBER: (num: number) => `Câu ${num}`,
    CONGRATS_TITLE: 'Chúc mừng bạn đã hoàn thành bài tập!',
    CONGRATS_GO_BACK: 'Quay lại bảng điều khiển',
  },
  GAPFILL: {
    MODE_LABEL: 'Luyện Điền Từ (Gap Fill)',
    SIDEBAR_TITLE: 'Chọn câu luyện nghe',
    CONGRATS_DESC: (count: number) => `Bạn đã luyện tập và kiểm tra đáp án cho toàn bộ ${count} câu thoại.`,
    EXERCISE_TITLE: 'ĐIỀN TỪ CÒN KHUYẾT',
    REPEAT_BUTTON: 'Lặp câu này',
    ACCURACY_LABEL: (accuracy: number) => `Độ chính xác: ${accuracy}%`,
    ACCURACY_STATS: (correct: number, total: number) => `Đúng ${correct} / ${total} từ`,
    TRANSLATION_TITLE: 'DỊCH NGHĨA CÂU',
    PREV_BUTTON: 'Câu trước',
    NEXT_BUTTON: 'Câu sau',
    SHOW_HINT: 'Gợi ý chữ cái đầu',
    HIDE_HINT: 'Ẩn gợi ý chữ đầu',
    ANSWERS_BUTTON: 'Đáp án',
    CHECK_BUTTON: 'Check đáp án',
  },
  DICTATION: {
    MODE_LABEL: 'Chép Chính Tả',
    STATS_TIME: 'Thời gian',
    STATS_COMPLETED: 'Hoàn thành',
    STATS_COMPLETED_VAL: (completed: number, total: number) => `${completed} / ${total} câu`,
    SIDEBAR_TITLE: 'Nội dung bài nghe',
    SIDEBAR_ROWS: (count: number) => `${count} dòng`,
    ACCURACY_LABEL: (acc: number) => `Đạt ${acc}%`,
    CONGRATS_DESC: (count: number) => `Bạn đã hoàn tất việc chép chính tả cho toàn bộ ${count} câu thoại của bài học này.`,
    FOCUS_LABEL: (current: number, total: number) => `Câu ${current} / ${total}`,
    REPEAT_BUTTON: 'Lặp câu này',
    SHOW_TRANSLATION: 'Hiện gợi ý dịch nghĩa',
    HIDE_TRANSLATION: 'Ẩn dịch nghĩa',
    TRANSLATION_TITLE: 'Dịch nghĩa câu:',
    INPUT_TITLE: 'Gõ lại tiếng Anh của câu vừa phát:',
    INPUT_PLACEHOLDER: 'Gõ từ khóa nghe được...',
    CLEAR_BUTTON: 'Xóa gõ lại',
    ACCURACY_STAT: (accuracy: number) => `Độ chính xác: ${accuracy}%`,
    ORIGINAL_ANSWER: 'Xem đáp án gốc thô',
    MISSING_WORD_TITLE: 'Thiếu từ',
    TYPED_WORD_TITLE: (typed: string) => `Bạn gõ: "${typed}"`,
    PREV_BUTTON: 'Câu trước',
    NEXT_BUTTON: 'Câu sau',
    ANSWERS_BUTTON: 'Xem đáp án',
    CHECK_BUTTON: 'Check chính tả',
  },
  QUIZ: {
    MODE_LABEL: 'Luyện Tập / Giải Đề',
    STATS_DONE: (done: number, total: number) => `Đã làm: ${done} / ${total}`,
    STATS_CORRECT: (correct: number, done: number) => `Đúng: ${correct} / ${done}`,
    PLAYER_TITLE: 'Trình phát âm thanh',
    PLAYER_TIP: 'Sử dụng thanh tiến trình bên dưới để tua audio',
    CONGRATS_TITLE: 'Chúc mừng bạn đã hoàn thành bài Quiz!',
    CONGRATS_DESC: 'Bạn đã hoàn tất tất cả các câu hỏi của bài học này.',
    CONGRATS_CORRECT_VAL: (correct: number, total: number) => `Đúng / ${total} câu`,
    CONGRATS_ACCURACY: 'Chính xác',
    QUESTION_LABEL: (idx: number) => `Câu hỏi ${idx}`,
    REPEAT_BUTTON: 'Nghe lại câu này',
    INPUT_PLACEHOLDER: 'Nhập đáp án của bạn...',
    CHECK_BUTTON: 'Kiểm tra đáp án',
    RESULT_CORRECT: 'Chính xác',
    RESULT_INCORRECT: 'Không đúng',
    RESULT_ANSWER_LABEL: 'Đáp án đúng:',
    RESULT_EXPLANATION: 'Giải thích chi tiết:',
  },
  SHADOWING: {
    MODE_LABEL: 'Luyện Nói Đuổi (Shadowing)',
    SIDEBAR_TITLE: 'Chọn câu luyện Shadow',
    CONGRATS_DESC: (count: number) => `Bạn đã luyện ghi âm toàn bộ ${count} câu thoại của bài nghe này.`,
    EXERCISE_TITLE: 'CÂU LUYỆN NÓI MẪU',
    TIMESTAMP_LABEL: (start: string, end: string) => `Mốc âm thanh: ${start} - ${end}`,
    STATUS_TITLE: 'TRẠNG THÁI',
    STATUS_RECORDING: 'Đang thu âm giọng đọc của bạn...',
    STATUS_DONE: 'Đã thu âm xong. Nhấp phát bên dưới để đối chiếu.',
    STATUS_READY: 'Sẵn sàng thu âm Shadowing',
    PLAY_SAMPLE_BUTTON: 'PHÁT GIỌNG MẪU',
    RECORD_BUTTON: 'THU ÂM GIỌNG BẠN',
    STOP_BUTTON: 'DỪNG THU ÂM',
    PLAY_USER_BUTTON: 'NGHE LẠI GIỌNG BẠN',
    PREV_BUTTON: 'Câu trước',
    NEXT_BUTTON: 'Câu sau',
  },
  TRANSCRIPT: {
    MODE_LABEL: 'Script Song Ngữ',
    DUAL_LANG_BUTTON: 'Dịch song ngữ',
    PLAYER_TIP: 'Click câu thoại để chuyển mốc phát âm thanh',
    SHADOWING_LINK: 'Luyện Shadowing',
  },
  PLAYER: {
    TRANSCRIPT_TAB: 'Lời thoại',
    SHADOW_WRITING_TAB: 'Shadow Writing',
    QUIZ_TAB: (count: number) => `Bài tập (${count})`,
    NO_SUBTITLES: 'Không tìm thấy phụ đề cho tài liệu nghe này.',
    SELECT_SENTENCE: 'Chọn câu luyện viết',
    SENTENCE_INDEX: (idx: number) => `Câu ${idx}`,
    CHECKED: 'Đã check',
    WORKSPACE: 'WORKSPACE',
    WORKSPACE_INDEX: (current: number, total: number) => `Câu ${current} / ${total}`,
    PLAY_SENTENCE: 'Phát âm thanh câu này',
    HEAR_AND_TYPE: 'Nghe và gõ lại những gì bạn nghe được:',
    RESULT_ANALYSIS: 'Phân tích kết quả:',
    FILL_ORIGINAL: 'Điền đáp án gốc',
    TRANSLATION: 'Dịch nghĩa:',
    PREV_SENTENCE: 'Câu trước',
    NEXT_SENTENCE: 'Câu sau',
    SHOW_ANSWER: 'Xem đáp án',
    CHECK_ANSWER: 'Check đáp án',
    NO_DICTATION: 'Không tìm thấy lời thoại để luyện nghe chính tả.',
    QUESTION_INDEX: (idx: number) => `Câu hỏi ${idx}`,
    REPLAY: 'Nghe lại',
    INPUT_PLACEHOLDER: 'Nhập đáp án của bạn...',
    CHECK_QUESTION: 'Kiểm tra đáp án',
    CORRECT: 'Chính xác',
    INCORRECT: 'Sai rồi',
    CORRECT_ANSWER_LABEL: 'Đáp án:',
    EXPLANATION_LABEL: 'Giải thích:',
    BILINGUAL: 'Song ngữ',
    SPEED_LABEL: (speed: number) => `Tốc độ: ${speed}x`,
    VOLUME: 'Âm lượng',
    TYPED_WORD_TITLE: (typed: string) => `Bạn gõ: "${typed}"`,
    MISSING_WORD_TITLE: 'Thiếu từ',
  }
} as const;

/**
 * Text strings and labels for Word Lookup Popover
 */
export const WORD_LOOKUP_TEXT = {
  DEFAULT_DEFINITION: 'Chưa có định nghĩa',
  ERROR_NOT_FOUND: 'Word not found',
  SAVE_SUCCESS_TITLE: 'Đã lưu từ vựng! 🎯',
  SAVE_SUCCESS_DESC: (word: string, setTitle: string) => `Đã thêm từ "${word}" vào bộ "${setTitle}"`,
  SAVE_ERROR_TITLE: 'Thao tác thất bại',
  SAVE_ERROR_DESC: 'Không thể thêm từ vào bộ từ vựng. Vui lòng thử lại.',
  PLAY_AUDIO_TOOLTIP: 'Nghe phát âm',
  LOADING: 'Đang tra từ điển...',
  NOT_FOUND_TITLE: 'Không tìm thấy từ này',
  NOT_FOUND_DESC: 'Từ vựng hiện chưa có trong cơ sở dữ liệu từ điển. Bạn có muốn nghe phát âm?',
  DEFINITION_LABEL: 'Định nghĩa',
  EXAMPLE_LABEL: 'Ví dụ',
  SAVE_TO_SET_TOOLTIP: 'Lưu từ vào bộ',
  CREATE_SET_WARNING: 'Hãy tạo một bộ từ vựng trước để lưu từ.',
} as const;

/**
 * Text strings and labels for Listening Card
 */
export const LISTENING_CARD_TEXT = {
  DEFAULT_AUTHOR: 'Danh mục Luyện nghe',
  COMMUNITY_LABEL: 'Cộng đồng',
  DICTATION_CTA: 'Chép chính tả',
} as const;

/**
 * Text strings and labels for Library Achievements Grid
 */
export const LIBRARY_ACHIEVEMENTS_TEXT = {
  TITLE: 'Huy Hiệu Học Tập',
  SUBTITLE: 'Mở khóa huy hiệu dựa trên nỗ lực của bạn',
} as const;

/**
 * Text strings and labels for Hub Trending Carousel
 */
export const HUB_TRENDING_TEXT = {
  TRENDING_BADGE: 'TRENDING',
} as const;
