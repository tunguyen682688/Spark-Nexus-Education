import { Search, Tag, Award } from 'lucide-react';

interface CommunitySidebarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  trendingTags: string[];
}

export function CommunitySidebar({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagSelect,
  trendingTags,
}: CommunitySidebarProps) {
  return (
    <section className="lg:col-span-3 space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Tìm kiếm bài viết..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-900/60 border border-slate-850 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 transition"
        />
      </div>

      <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-900 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <Tag className="h-4 w-4 text-indigo-400" /> Chủ Đề Nổi Bật
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onTagSelect('')}
            className={`text-xs px-3 py-1.5 rounded-xl transition font-medium ${
              !selectedTag
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            Tất cả
          </button>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagSelect(tag)}
              className={`text-xs px-3 py-1.5 rounded-xl transition font-medium ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900/80 to-indigo-950/20 border border-slate-900 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
          <Award className="h-4 w-4 text-indigo-400" /> Bảng Thống Kê Đóng Góp
        </h3>
        <p className="text-xs text-slate-400">Đóng góp câu hỏi được phê duyệt để nhận phần thưởng lớn:</p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-center">
            <span className="block text-lg font-bold text-indigo-400">15 XP</span>
            <span className="text-[10px] text-slate-500 block">Khi gửi ý tưởng</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-center">
            <span className="block text-lg font-bold text-emerald-400">50 XP</span>
            <span className="text-[10px] text-slate-500 block">Khi được xuất bản</span>
          </div>
        </div>
      </div>
    </section>
  );
}
