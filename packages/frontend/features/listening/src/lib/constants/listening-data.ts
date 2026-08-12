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
