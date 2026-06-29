export const TRAP_CATEGORIES = [
  {
    key: 'syntax',
    label: 'Cú pháp',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    fullLabel: 'Cú pháp (Syntax)',
  },
  {
    key: 'tenses',
    label: 'Thì & Động từ',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    fullLabel: 'Thì & Sự hòa hợp (Tenses)',
  },
  {
    key: 'morphology',
    label: 'Hình thái từ',
    badgeClass: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    fullLabel: 'Hình thái học (Morphology)',
  },
  {
    key: 'modality',
    label: 'Sắc thái',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    fullLabel: 'Sắc thái giả định (Modality)',
  },
] as const;

export const TRAP_STATUSES = [
  {
    key: 'ALL',
    label: 'Tất Cả Trạng Thái',
    activeClass: 'bg-indigo-500/10 border border-indigo-500/35 text-indigo-400',
  },
  {
    key: 'TRAPPED',
    label: '🕸️ Đang Vướng',
    activeClass: 'bg-indigo-500/10 border border-indigo-500/35 text-indigo-400',
  },
  {
    key: 'BROKEN',
    label: '⚔️ Đã Phá',
    activeClass: 'bg-indigo-500/10 border border-indigo-500/35 text-indigo-400',
  },
] as const;

export const trapDiaryConstants = {
  trapDiary: {
    loading: 'Đang tải danh sách bẫy ngữ pháp của bạn từ database...',
    btnBack: 'Quay lại Lộ trình',
    tagPersonalized: 'SỔ TAY CÁ NHÂN HÓA CAO',
    tagAiAnalysis: 'Giải mã bẫy lỗi bằng Trợ Lý AI',
    title: 'Sổ Tay Bẫy Ngữ Pháp',
    subtitle: 'Tự động lưu vết mọi câu làm sai từ quá trình học. Nhận phân tích chuyên sâu của AI, học thuộc các câu thần chú Mnemonic và thực hiện phá bẫy!',
    btnCampaign: 'Chiến Dịch Phá Bẫy ({count})',
    statTrapped: 'Đang Vướng Bẫy 🕸️',
    statTrappedDesc: 'Cần ôn tập luyện lại để phá bẫy',
    statBroken: 'Đã Phá Thành Công ⚔️',
    statBrokenDesc: 'Đã hoàn thành xuất sắc và nhận XP',
    statRatio: 'Tỷ lệ Phá Bẫy 📊',
    statRatioDesc: 'Tiến độ củng cố lỗ hổng kiến thức',
    skillAll: 'Tất Cả Kỹ Năng',
    badgeTrapped: '🕸️ ĐANG VƯỚNG',
    badgeBroken: '⚔️ ĐÃ PHÁ',
    dateLabel: 'Lưu ngày: ',
    btnAiAnalysis: '💡 AI Giải Mã Bẫy',
    btnAiAnalysisView: 'Xem AI Phân Tích',
    questionLabel: 'Câu hỏi vướng lỗi:',
    answerUser: 'Đáp án sai của bạn:',
    answerCorrect: 'Đáp án đúng chuẩn:',
    answerEmpty: '(Không có)',
    explanationLabel: 'Giải thích nguyên bản:',
    aiTitle: 'Trợ Lý AI Phân Tích Sư Phạm',
    noTrapsTitle: 'Hiện không có bẫy ngữ pháp nào phù hợp bộ lọc.',
    noTrapsDesc: 'Hãy tiếp tục học lý thuyết và luyện đề thi để thu thập bẫy!',
    campaignExamTitle: 'Chiến Dịch Phá Bẫy Ngữ Pháp',
  },
};

