/**
 * UI text constants for the Reading Content Studio.
 * All user-facing strings are centralized here for maintainability and future i18n.
 */
export const STUDIO_UI_TEXT = {
  // ── Header ──
  TITLE: 'Studio Nội Dung',
  PREVIEW: 'Xem Trước',

  // ── Breadcrumb Workflow ──
  BREADCRUMB_DRAFT: 'NHÁP',
  BREADCRUMB_REVIEW: 'ĐÁNH GIÁ',
  BREADCRUMB_PUBLISH: 'XUẤT BẢN',

  // ── Content Type Tabs ──
  TAB_ARTICLE: 'Bài Viết',
  TAB_BOOK_CHAPTER: 'Chương Sách',
  TAB_NEWS: 'Tin Tức',
  TAB_BLOG: 'Blog',

  // ── Empty State ──
  EMPTY_TITLE: 'Bắt đầu dự án mới của bạn',
  EMPTY_DESC: 'Chọn một phương thức bên dưới để bắt đầu soạn thảo nội dung học thuật chuyên sâu của bạn.',
  BTN_CREATE_NEW: 'Tạo bài viết mới',
  BTN_IMPORT_URL: 'Nhập từ URL',
  BTN_CHOOSE_TEMPLATE: 'Chọn từ mẫu',

  // ── Sidebar ──
  SIDEBAR_NO_CONTENT_TITLE: 'Chưa có nội dung',
  SIDEBAR_NO_CONTENT_DESC: 'Vui lòng bắt đầu soạn thảo để thiết lập ngữ cảnh xuất bản.',
  SIDEBAR_COVER_IMAGE: 'Ảnh Bìa',
  SIDEBAR_DRAG_DROP: 'Kéo & thả ảnh',
  SIDEBAR_DRAG_DROP_SUB: 'hoặc nhấp để tải lên (16:9)',
  SIDEBAR_COVER_URL_PLACEHOLDER: 'Nhập URL ảnh bìa...',

  // ── Stats ──
  STATS_WORDS: 'TỪ',
  STATS_TIME: 'THỜI GIAN',
  STATS_NO_VALUE: '--',

  // ── Editor ──
  EDITOR_TITLE_PLACEHOLDER: 'Nhập tiêu đề bài viết...',
  EDITOR_CONTENT_PLACEHOLDER: 'Bắt đầu soạn thảo nội dung tại đây...\n\nSử dụng Markdown hoặc viết trực tiếp. Mỗi đoạn văn cách nhau bằng một dòng trống.',
  EDITOR_SUMMARY_PLACEHOLDER: 'Viết tóm tắt ngắn gọn cho bài viết (tùy chọn)...',
  EDITOR_TAGS_PLACEHOLDER: 'Thêm tag (nhấn Enter)...',
  EDITOR_CATEGORY_PLACEHOLDER: 'Chọn danh mục...',
  EDITOR_DIFFICULTY_PLACEHOLDER: 'Chọn cấp độ CEFR...',
  EDITOR_SOURCE_URL_PLACEHOLDER: 'URL nguồn (nếu có)...',
  EDITOR_AUTHOR_PLACEHOLDER: 'Tên tác giả (nếu không phải bạn)...',

  // ── Footer ──
  BTN_CANCEL: 'Huỷ Bỏ',
  BTN_SAVE_DRAFT: 'Lưu Nháp',
  BTN_PUBLISH: 'Xuất Bản Ngữ Cảnh',

  // ── Auto Save ──
  AUTOSAVE_SAVING: 'Đang lưu...',
  AUTOSAVE_SAVED: 'Đã lưu',
  AUTOSAVE_ERROR: 'Lỗi khi lưu',
  AUTOSAVE_IDLE: 'Chưa lưu',

  // ── Publishing Checklist ──
  CHECKLIST_TITLE: 'Danh sách kiểm tra',
  CHECKLIST_HAS_TITLE: 'Có tiêu đề (≥ 3 ký tự)',
  CHECKLIST_HAS_CONTENT: 'Có nội dung (≥ 50 từ)',
  CHECKLIST_HAS_CATEGORY: 'Đã chọn danh mục',
  CHECKLIST_HAS_DIFFICULTY: 'Đã chọn cấp độ CEFR',

  // ── Template Picker ──
  TEMPLATE_MODAL_TITLE: 'Chọn mẫu bài viết',
  TEMPLATE_MODAL_DESC: 'Chọn một mẫu để bắt đầu nhanh. Bạn có thể chỉnh sửa sau.',
  TEMPLATE_BTN_USE: 'Sử dụng mẫu',

  // ── Preview Modal ──
  PREVIEW_MODAL_TITLE: 'Xem trước bài viết',
  PREVIEW_CLOSE: 'Đóng',

  // ── Toast Messages ──
  TOAST_TITLE_SUCCESS: 'Thành công',
  TOAST_TITLE_ERROR: 'Lỗi',
  TOAST_TITLE_DELETED: 'Đã xoá',
  TOAST_TITLE_INFO: 'Thông báo',
  TOAST_DRAFT_SAVED: 'Bản nháp đã được lưu thành công.',
  TOAST_PUBLISHED: 'Bài viết đã được xuất bản thành công!',
  TOAST_DELETED: 'Bài viết đã bị xoá.',
  TOAST_ERROR: 'Đã xảy ra lỗi. Vui lòng thử lại.',
  TOAST_URL_IMPORT_COMMING_SOON: 'Tính năng nhập từ URL sẽ sớm ra mắt.',
  DEFAULT_CHAPTER_TITLE: 'Chương mới',

  // ── Confirm Dialog ──
  CONFIRM_DISCARD_TITLE: 'Huỷ bỏ bài viết?',
  CONFIRM_DISCARD_DESC: 'Bạn có chắc muốn huỷ bỏ? Tất cả nội dung chưa lưu sẽ bị mất.',
  CONFIRM_YES: 'Huỷ bỏ',
  CONFIRM_NO: 'Tiếp tục soạn',

  // ── Categories ──
  CATEGORIES: [
    { value: 'education', label: 'Giáo dục' },
    { value: 'technology', label: 'Công nghệ' },
    { value: 'science', label: 'Khoa học' },
    { value: 'business', label: 'Kinh doanh' },
    { value: 'arts', label: 'Nghệ thuật' },
    { value: 'environment', label: 'Môi trường' },
    { value: 'health', label: 'Sức khoẻ' },
    { value: 'literature', label: 'Văn học' },
    { value: 'history', label: 'Lịch sử' },
    { value: 'philosophy', label: 'Triết học' },
  ] as const,

  CEFR_LEVELS: [
    { value: 'A1', label: 'A1 — Beginner' },
    { value: 'A2', label: 'A2 — Elementary' },
    { value: 'B1', label: 'B1 — Intermediate' },
    { value: 'B2', label: 'B2 — Upper Intermediate' },
    { value: 'C1', label: 'C1 — Advanced' },
    { value: 'C2', label: 'C2 — Proficiency' },
  ] as const,
  DEFAULT_CHAPTER_1_TITLE: 'Chương 1: Khởi đầu',
  UNTITLED_BOOK: 'Sách chưa đặt tên',
  UNTITLED_ARTICLE: 'Bài viết chưa đặt tên',
  UNCLASSIFIED_CATEGORY: 'Chưa phân loại',
} as const;

