import {
  Headset,
  Video,
  Award,
  Sparkles,
  Globe,
  Library,
  Music
} from 'lucide-react';

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

/**
 * Standard CEFR Levels Array
 */
export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

/**
 * Detailed CEFR rank definitions (explanations, gradient colors, badges)
 */
export const CEFR_RANK_DETAILS: Record<string, { title: string; desc: string; colorClass: string }> = {
  A1: {
    title: 'Sơ Cấp (A1 Beginner)',
    desc: 'Bạn vừa bắt đầu hành trình chinh phục tiếng Anh bản xứ.',
    colorClass: 'from-green-500/20 to-emerald-600/30 border-green-500/30 text-green-400',
  },
  A2: {
    title: 'Sơ Trung Cấp (A2 Elementary)',
    desc: 'Có thể nghe hiểu các hội thoại giao tiếp cơ bản.',
    colorClass: 'from-green-400/20 to-teal-500/30 border-teal-500/30 text-teal-400',
  },
  B1: {
    title: 'Trung Cấp (B1 Intermediate)',
    desc: 'Nghe hiểu tốt các nội dung podcasts và bản tin ngắn.',
    colorClass: 'from-blue-500/20 to-indigo-600/30 border-blue-500/30 text-blue-400',
  },
  B2: {
    title: 'Trung Cao Cấp (B2 Upper-Intermediate)',
    desc: 'Có thể nghe hiểu tốt các bài thuyết trình chuyên môn phức tạp.',
    colorClass: 'from-indigo-500/20 to-violet-600/30 border-indigo-500/30 text-indigo-400',
  },
  C1: {
    title: 'Cao Cấp (C1 Advanced)',
    desc: 'Nghe hiểu chuẩn xác mọi tốc độ và ngữ điệu khác nhau.',
    colorClass: 'from-purple-500/20 to-pink-600/30 border-purple-500/30 text-purple-400',
  },
  C2: {
    title: 'Thành Thạo (C2 Mastery)',
    desc: 'Khả năng nghe hiểu toàn diện, tương đương người bản xứ.',
    colorClass: 'from-amber-500/20 to-orange-600/30 border-amber-500/30 text-amber-400',
  },
  unknown: {
    title: 'Chưa Xếp Hạng',
    desc: 'Hãy luyện nghe bài học đầu tiên để kích hoạt thứ hạng.',
    colorClass: 'from-slate-500/20 to-slate-600/30 border-slate-500/30 text-slate-400',
  },
};

/**
 * Daily Goal Settings
 */
export const DAILY_LISTENING_TARGET_MINUTES = 30;

/**
 * Listening Category Configurations (Labels, values, Icons)
 */
export const LISTENING_CATEGORIES = [
  { value: 'all', label: 'Tất cả bài học', icon: Globe },
  { value: 'podcast', label: 'Podcasts & Talkshow', icon: Headset },
  { value: 'video', label: 'Video Luyện Nghe', icon: Video },
  { value: 'exam', label: 'Đề Luyện Thi', icon: Award },
  { value: 'audio', label: 'Sách Nói (Audiobooks)', icon: Music },
  { value: 'news', label: 'Bản Tin Ngắn (News)', icon: Library },
  { value: 'community', label: 'Góc Cộng Đồng', icon: Sparkles },
] as const;

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

/**
 * Text strings and labels for Listening Hub Container
 */
export const LISTENING_HUB_TEXT = {
  BANNER: {
    BADGE: 'KHÔNG GIAN LUYỆN NGHE CHUYÊN SÂU',
    TITLE: 'Phát Triển Phản Xạ Nghe Tiếng Anh Toàn Diện',
    DESC: 'Cung cấp hệ thống bài nghe đa định dạng: Podcasts, Audio, Đề thi thực chiến và Video trực quan. Tập trung học thông qua 5 chế độ: Script, Shadowing, Chép chính tả, Gap Fill và Trắc nghiệm.',
    EXPLORE_CTA: 'KHÁM PHÁ KHO BÀI HỌC',
    LIBRARY_CTA: 'THƯ VIỆN CỦA TÔI',
    CONTRIBUTE_CTA: 'ĐÓNG GÓP BÀI NGHE MỚI',
  },
  FILTERS: {
    SEARCH_PLACEHOLDER: 'Tìm bài nghe, chủ đề, kỳ thi, diễn giả...',
    LEVEL_LABEL: 'Cấp độ:',
    ALL_LEVELS: 'Tất cả',
    SOURCE_LABEL: 'Mọi nguồn tệp',
    SOURCE_SYSTEM: 'Spark Nexus',
    SOURCE_COMMUNITY: 'Cộng đồng đóng góp',
  },
  LOADING: 'Đang chuẩn bị kho tài liệu học nghe...',
  ERROR: 'Lỗi kết nối máy chủ. Vui lòng tải lại trang hoặc kiểm tra kết nối mạng.',
  EMPTY: 'Không tìm thấy bài luyện nghe nào khớp với bộ lọc tìm kiếm hiện tại.',
  SEARCH_RESULTS: (count: number) => `Kết quả tìm kiếm (${count} kết quả)`,
  RESET_SEARCH_CTA: 'Xóa tất cả bộ lọc',
  TRENDING: {
    TITLE: 'Xu Hướng Luyện Nghe Hot 🔥',
    SUBTITLE: 'Những tài liệu học được chú ý nhất tuần qua',
    DEFAULT_AUTHOR: 'Tác giả Spark Nexus',
    VIEWS_UNIT: 'lượt nghe',
    LINES_UNIT: (count: number) => `${count} câu thoại`,
  },
  PODCASTS: {
    TITLE: 'Podcasts & Audio Trò Chuyện 🎙️',
    SUBTITLE: 'Luyện nghe hội thoại, bản tin Anh - Mỹ tự nhiên',
    VIEW_ALL: '• Xem tất cả',
    DEFAULT_AUTHOR: 'Diễn giả bản xứ',
    DURATION_UNIT: (min: number) => `${min}m`,
  },
  EXAMS: {
    TITLE: 'Luyện Thi Chứng Chỉ (TOEIC / IELTS) 🏆',
    SUBTITLE: 'Các bài luyện tập trắc nghiệm và chép chính tả mô phỏng đề thi',
    VIEW_ALL: '• Xem tất cả',
    QUESTIONS_UNIT: (count: number) => `${count} CH`,
    VIEWS_UNIT: 'lượt nghe',
    MINUTES_UNIT: (min: number) => `${min} phút`,
  },
  VIDEOS: {
    TITLE: 'Xem Video Luyện Nghe 📺',
    SUBTITLE: 'Học nghe kèm hình ảnh phụ đề trực quan hỗ trợ phản xạ',
    VIEW_ALL: '• Xem tất cả',
    DEFAULT_AUTHOR: 'Youtube Channel',
  },
  COMMUNITY: {
    TITLE: 'Góc Chia Sẻ Cộng Đồng 👥',
    SUBTITLE: 'Tài liệu học nghe phong phú chia sẻ bởi các thành viên',
    VIEW_ALL: '• Xem tất cả',
    ADD_CTA: 'Đóng góp bài nghe',
    ADD_DESC: 'Tự tạo bài nghe với transcript riêng của bạn',
    EMPTY: 'Chưa có bài nghe đóng góp nào khác. Hãy là người đóng góp đầu tiên!',
    DEFAULT_AUTHOR: 'Học viên',
  }
} as const;

/**
 * Text strings and labels for Listening Contribution Form (Creation Studio)
 */
export const LISTENING_CONTRIBUTE_TEXT = {
  BACK_TO_LIST: 'QUAY LẠI DANH SÁCH BÀI NGHE',
  HEADER_TITLE: 'Creation Studio: Biên soạn bài học Luyện nghe',
  STEPS: {
    STEP_1: 'Bước 1: Thiết lập thông tin và liên kết tệp',
    STEP_1_DESC: 'Điền thông tin và liên kết video bài nghe từ tệp MP3/YouTube.',
    STEP_2: 'Bước 2: TIME-SYNC SUBTITLE STUDIO',
    STEP_3: 'Bước 3: QUIZ & QUESTIONS BUILDER',
    STEP_4: 'Bước 4: Xem trước bài học thực tế (Live Preview)',
  },
  STEP_1_FORM: {
    TITLE_LABEL: 'Tiêu đề bài nghe *',
    TITLE_PLACEHOLDER: 'Ví dụ: BBC Learning English - Business Talk',
    AUTHOR_LABEL: 'Diễn giả / Tác giả',
    AUTHOR_PLACEHOLDER: 'Ví dụ: BBC News',
    MEDIA_LABEL: 'Đường dẫn tệp Audio (Direct link MP3 hoặc YouTube Video URL) *',
    MEDIA_PLACEHOLDER: 'https://example.com/audio.mp3 hoặc https://www.youtube.com/watch?v=...',
    MEDIA_TIP: 'Gợi ý: Dán đường dẫn YouTube, hệ thống sẽ tự động chuyển sang danh mục Video và ghim ảnh thu nhỏ của YouTube.',
    THUMBNAIL_LABEL: 'Đường dẫn ảnh bìa tệp (Thumbnail URL)',
    THUMBNAIL_PLACEHOLDER: 'https://example.com/cover.jpg (Để trống để tự động lấy từ YouTube)',
    CATEGORY_LABEL: 'Danh mục',
    DIFFICULTY_LABEL: 'Cấp độ khó',
    DURATION_LABEL: 'Thời lượng (giây)',
    TAGS_LABEL: 'Từ khóa nhãn (Tags - phân chia cách nhau bởi dấu phẩy)',
    TAGS_PLACEHOLDER: 'IELTS, BBC, Business, Dialogue...',
    DESC_LABEL: 'Mô tả chi tiết bài nghe',
    DESC_PLACEHOLDER: 'Giới thiệu khái quát nội dung bài học...',
    CONTINUE_CTA: 'Tiếp tục (Bước 2)',
  },
  STEP_2_STUDIO: {
    STUDIO_TITLE: 'Trình Phát Studio',
    DEFAULT_TITLE: 'Đang biên soạn tệp...',
    SYNC_BOX_TITLE: 'ĐỒNG BỘ MỐC LỜI THOẠI NHANH',
    SYNC_BOX_DESC: 'Bật phát âm thanh, nhấp nút "Chạm ghim mốc" để tự động đánh dấu thời gian câu nói:',
    SYNC_BOX_TIP_1: 'Lần 1: Ghim thời gian Bắt đầu câu.',
    SYNC_BOX_TIP_2: 'Lần 2: Ghim thời gian Kết thúc câu và tự động nhảy câu tiếp theo.',
    SYNC_BOX_CTA: (index: number) => `Chạm ghim mốc câu #${index}`,
    EDITOR_TITLE: 'Biên soạn Lời thoại & Dịch nghĩa',
    EDITOR_DESC: 'Đồng bộ mốc giây chạy phụ đề khớp lời người nói.',
    BULK_OPEN_CTA: 'Nhập thô nhanh',
    BULK_CLOSE_CTA: 'Đóng nhập nhanh',
    ADD_ROW_CTA: 'Thêm dòng',
    BULK_LABEL: 'Nhập đoạn văn bản thô (Tách câu tự động theo dòng)',
    BULK_PLACEHOLDER: 'Dán toàn bộ lời thoại tiếng Anh tại đây. Mỗi câu văn một dòng...',
    BULK_CANCEL: 'Hủy',
    BULK_APPLY: 'Tách câu & Thay thế danh sách',
    EMPTY_LIST: 'Chưa có dòng lời thoại nào được thiết lập. Hãy thêm dòng hoặc bấm "Nhập thô nhanh".',
    ROW_LABEL: (order: number) => `Dòng #${order}`,
    START_LABEL: 'start:',
    END_LABEL: 'end:',
    GHIM_CTA: 'ghim',
    PLAY_ROW_TITLE: 'Phát thử dòng phụ đề này',
    TEXT_PLACEHOLDER: 'Lời thoại tiếng Anh...',
    TRANSLATION_PLACEHOLDER: 'Bản dịch tiếng Việt (Không bắt buộc)...',
    BACK_CTA: 'Quay lại Bước 1',
    CONTINUE_CTA: 'Tiếp tục (Bước 3)',
  },
  STEP_3_QUIZ: {
    DEFAULT_TITLE: 'Tài liệu nghe...',
    SYNC_BOX_TITLE: 'GIẢI THÍCH MỐC HỎI THI',
    SYNC_BOX_DESC: 'Đồng bộ mốc giây audio tương ứng cho từng câu hỏi bằng cách ghim lại vị trí audio phát. Học viên khi làm bài sẽ dễ dàng nhấn "Nghe lại đoạn gợi ý" để ôn tập nhanh chóng.',
    EDITOR_TITLE: 'Biên soạn Bộ câu hỏi luyện đề (Quiz Builder)',
    EDITOR_DESC: 'Học trắc nghiệm hoặc điền khuyết với mốc audio đồng bộ.',
    ADD_QUESTION_CTA: 'Thêm câu hỏi',
    EMPTY_LIST: 'Chưa thiết lập câu hỏi ôn tập nào. Bạn có thể bỏ qua bước này nếu tệp là Podcast/Audio nghe thông thường.',
    QUESTION_LABEL: (order: number) => `Câu hỏi #${order}`,
    TYPE_LABEL: 'Loại:',
    TYPE_MULTIPLE_CHOICE: 'Trắc nghiệm',
    TYPE_GAP_FILL: 'Điền từ',
    TIMESTAMP_LABEL: 'Mốc:',
    GHIM_CTA: 'ghim phát',
    QUESTION_TEXT_LABEL: 'Đề bài câu hỏi *',
    QUESTION_TEXT_PLACEHOLDER: 'Ví dụ: What are the speakers talking about?',
    OPTION_PLACEHOLDER: (opt: string) => `Lựa chọn ${opt}...`,
    CORRECT_ANSWER_LABEL: 'Đáp án đúng *',
    CORRECT_ANSWER_SELECT_PLACEHOLDER: 'Chọn đáp án...',
    CORRECT_ANSWER_SELECT_OPTION: (opt: string) => `Lựa chọn ${opt}`,
    CORRECT_ANSWER_INPUT_PLACEHOLDER: 'Nhập từ đúng (ví dụ: facilities)...',
    EXPLANATION_LABEL: 'Giải thích đáp án (Giải thích cho học viên)',
    EXPLANATION_PLACEHOLDER: 'Nhập phần giải thích lý do đáp án này đúng...',
    BACK_CTA: 'Quay lại Bước 2',
    CONTINUE_CTA: 'Xem trước & Xuất bản (Bước 4)',
  },
  STEP_4_PREVIEW: {
    TITLE: 'Bước 4: Xem trước bài học thực tế (Live Preview)',
    DESC: 'Đây là giao diện tương tác của học viên khi học tập. Hãy chắc chắn phụ đề hiển thị khớp nhạc và câu hỏi đầy đủ.',
    BACK_CTA: 'Quay lại Bước 3',
    PUBLISH_CTA: 'XUẤT BẢN TÀI LIỆU',
    PUBLISHING_CTA: 'ĐANG XUẤT BẢN...',
  }
} as const;

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


