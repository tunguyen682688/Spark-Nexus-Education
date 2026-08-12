/**
 * Text strings and labels for Study Dashboard Container
 */
export const LISTENING_DASHBOARD_TEXT = {
  LOADING_MATERIAL: 'Đang tải thông tin bài học...',
  ERROR_NOT_FOUND_TITLE: 'Không tìm thấy bài học',
  ERROR_NOT_FOUND_DESC: 'Tài liệu học có thể đã bị xóa hoặc đường dẫn không khả dụng.',
  BACK_TO_HOME: 'Quay lại trang chủ',
  BACK_TO_LIST: 'QUAY LẠI DANH SÁCH BÀI NGHE',
  LEVEL_LABEL: 'Cấp độ',
  COMMUNITY_CONTRIBUTED: 'Cộng đồng đóng góp',
  VIEW_COUNT: 'lượt xem',
  DESCRIPTION_TITLE: 'Mô tả bài học',
  DEFAULT_DESCRIPTION: 'Không có mô tả chi tiết cho tài liệu học nghe này. Hãy bắt đầu chọn phương thức học bên dưới để luyện kỹ năng nghe của bạn ngay lập tức.',
  BOOKMARK_SAVE: 'Lưu Bài Học',
  BOOKMARK_SAVED: 'Đã Lưu Vào Thư Viện',
  FAVORITE_BUTTON: 'Yêu Thích',
  PROGRESS_TITLE: 'Tiến độ học tập',
  PROGRESS_COMPLETED: 'Đã hoàn thành',
  STATS_PRACTICE: 'Luyện tập',
  STATS_TIME_UNIT: 'phút',
  STATS_SUBTITLES: 'Định dạng câu',
  STATS_SUBTITLES_UNIT: 'câu thoại',
  WORKSPACES_TITLE: 'Không gian luyện tập',
  MODES: {
    TRANSCRIPT: {
      TITLE: '1. Nghe Script Song Ngữ',
      DESC: 'Nghe đồng bộ chữ chạy phụ đề, tra cứu từ vựng và xem bản dịch Việt-Anh.',
    },
    DICTATION: {
      TITLE: '2. Chép Chính Tả Chuyên Sâu',
      DESC: 'Gõ lại từng câu thoại, kiểm tra độ chính xác khớp chữ và luyện phản xạ nghe.',
    },
    GAPFILL: {
      TITLE: '3. Nghe Điền Từ Khóa (Gap Fill)',
      DESC: 'Luyện nghe chi tiết bằng cách điền từ khóa còn khuyết trong phụ đề.',
    },
    SHADOWING: {
      TITLE: '4. Luyện Nói Đuổi / Shadowing',
      DESC: 'Ghi âm đối chiếu cao độ và nhịp điệu phát âm với giọng người bản xứ.',
    },
    QUIZ: {
      TITLE: '5. Làm Bài Tập Trắc Nghiệm',
      DESC: 'Luyện đề thi TOEIC/IELTS với câu hỏi chọn đáp án hoặc điền khuyết có giải thích.',
    },
    VOCABULARY: {
      TITLE: '6. Học Từ Vựng Bài Học',
      DESC: 'Ôn tập bộ từ vựng, flashcard và làm bài kiểm tra từ vựng đi kèm tài liệu nghe.',
    },
    QUIZ_EMPTY: '(Không có sẵn bài tập trắc nghiệm cho bài học này)',
  },
} as const;

/**
 * Text strings and labels for Listening Explore Container
 */
export const LISTENING_EXPLORE_TEXT = {
  BACK_TO_HOME: 'QUAY LẠI TRANG CHỦ',
  TITLE: 'Khám Phá Kho Tàng Luyện Nghe',
  SUBTITLE: 'Bộ sưu tập đa dạng thể loại và cấp độ, giúp bứt phá phản xạ tiếng Anh.',
  SHOWING_COUNT: (current: number, total: number) => `Đang hiển thị ${current} / ${total} bài luyện nghe`,
  LEVEL_PREFIX: 'Cấp độ: ',
  LOADING_DATA: 'Đang kết nối kho dữ liệu...',
  ERROR_TITLE: 'Không thể tải danh sách bài nghe. Vui lòng kiểm tra lại kết nối.',
  EMPTY_TITLE: 'Không tìm thấy bài luyện nghe nào khớp với bộ lọc của bạn.',
  RESET_FILTERS_CTA: 'Xóa bộ lọc để thử lại',
  SIDEBAR: {
    TITLE: 'Bộ lọc tìm kiếm',
    RESET_CTA: 'Xóa lọc',
    KEYWORD_LABEL: 'Từ khóa',
    KEYWORD_PLACEHOLDER: 'Nhập tên bài, diễn giả...',
    SORT_LABEL: 'Sắp xếp theo',
    SORT_OPTIONS: {
      NEWEST: 'Bài học mới nhất',
      VIEWS: 'Lượt nghe nhiều nhất',
      SUBTITLES: 'Nhiều câu thoại nhất',
    },
    CEFR_LABEL: 'Cấp độ (CEFR)',
    ALL_LEVELS: 'Tất cả',
  }
} as const;

/**
 * Text strings and labels for Listening Library Container
 */
export const LISTENING_LIBRARY_TEXT = {
  BACK_TO_HUB: 'QUAY LẠI TRANG CHỦ LUYỆN NGHE',
  TITLE: 'Thư Viện Luyện Nghe Của Tôi',
  SUBTITLE: 'Theo dõi tiến trình học tập cá nhân, thống kê chi tiết và thành tích đạt được',
  STREAK_CARD: {
    LABEL: 'Chuỗi Học Tập',
    STREAK_UNIT: 'ngày liên tục',
    STREAK_ACTIVE: 'Tuyệt vời! Hãy nghe thêm 1 bài hôm nay để giữ vững phong độ học tập!',
    STREAK_INACTIVE: 'Bắt đầu ngay hôm nay để kích hoạt chuỗi học tập liên tục nào!',
    GOAL_LABEL: 'Mục tiêu',
    GOAL_VALUE: 'Học mỗi ngày',
  },
  DAILY_GOAL_CARD: {
    LABEL: 'Mục Tiêu Hôm Nay',
    UNIT: 'phút',
    PROGRESS_LABEL: 'Tiến độ ngày',
    ACTIVITY_LABEL: 'Hoạt động hôm nay',
    STATUS_COMPLETED: 'Hoàn thành',
    STATUS_IN_PROGRESS: 'Đang thực hiện',
  },
  RECENTLY_STUDIED: {
    TITLE: 'Học Tiếp Gần Đây',
    DEFAULT_CATEGORY: 'học phần',
    CONTINUE_CTA: 'Tiếp',
  },
  TABS: {
    IN_PROGRESS: (count: number) => `Đang học (${count})`,
    COMPLETED: (count: number) => `Đã hoàn thành (${count})`,
    BOOKMARKS: (count: number) => `Đã đánh dấu (${count})`,
  },
  SYNCING_LIBRARY: 'Đang đồng bộ dữ liệu thư viện...',
  ERROR_LOADING_LIBRARY: 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.',
  IN_PROGRESS_EMPTY: {
    TITLE: 'Không có bài luyện nghe nào đang học dở.',
    EXPLORE_CTA: 'Khám phá các bài học mới ngay',
  },
  COMPLETED_EMPTY: {
    TITLE: 'Bạn chưa hoàn thành bài luyện nghe nào đạt 100%.',
    DESC: 'Hãy tiếp tục luyện tập và hoàn thành trọn vẹn tệp âm thanh để lưu lại lịch sử thành tích nhé!',
  },
  BOOKMARKS_EMPTY: {
    TITLE: 'Thư mục bài nghe yêu thích đang trống.',
    DESC: 'Bạn có thể ghim bài nghe bằng cách nhấp vào biểu tượng Bookmark trên Bảng điều khiển học tập.',
  },
  BOOKMARK_ITEM: {
    REMOVE_TITLE: 'Xóa khỏi thư viện lưu trữ',
  },
  STATS_SUMMARY: {
    TITLE: 'Chỉ số Học tập Tổng quan',
    SUBTITLE: 'Tiến độ tích lũy từ các bài học',
    TIME_SPENT: 'Thời gian nghe',
    TIME_UNIT: 'phút',
    COMPLETED_COUNT: 'Hoàn thành',
    COMPLETED_UNIT: 'bài',
    AVERAGE_PROGRESS: 'Tiến độ trung bình',
  },
  LEVEL_BREAKDOWN: {
    TITLE: 'Phân tích Cấp độ Đã học',
    SUBTITLE: 'Số bài học đã tương tác chia theo độ khó',
    LEVEL_PREFIX: 'Cấp độ ',
    LESSONS_COUNT: (count: number) => `${count} bài học`,
  }
} as const;
