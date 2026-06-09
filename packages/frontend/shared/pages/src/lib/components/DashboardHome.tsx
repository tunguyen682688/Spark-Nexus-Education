import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Zap, Award, ChevronRight, Flame, Clock, Star } from 'lucide-react';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';

// Minimal VocabularySet shape needed for display (avoid cross-package import)
export interface DashboardVocabularySet {
  id: string;
  title: string;
  entryCount: number;
  studyCount?: number | null;
}

export interface DashboardHomeProps {
  user?: { name?: string; firstName?: string; username?: string; email?: string } | null;
  mySets?: DashboardVocabularySet[];
  isLoadingSets?: boolean;
  streak?: number;
  dailyProgress?: number;
  dailyGoal?: number;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Chào buổi sáng';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function formatDate(): string {
  return new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Daily goal progress bar
const DailyGoalBar = ({ current, goal }: { current: number; goal: number }) => {
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 font-semibold">Mục tiêu hôm nay</span>
        <span className="text-blue-400 font-extrabold">{current} / {goal} từ</span>
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// Set progress card
const SetProgressCard = ({
  set,
  onClick,
}: {
  set: DashboardVocabularySet;
  onClick: () => void;
}) => {
  const pct =
    set.entryCount > 0
      ? Math.min(100, Math.round(((set.studyCount || 0) / set.entryCount) * 100))
      : 0;

  return (
    <div
      onClick={onClick}
      className="group flex flex-col gap-3 p-4 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-200 group-hover:text-white truncate">
            {set.title}
          </h3>
          <span className="text-[10px] text-slate-500 font-semibold">{set.entryCount} từ</span>
        </div>
        <span
          className={`text-xs font-extrabold px-2 py-0.5 rounded-full border ${
            pct >= 80
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
              : pct >= 40
              ? 'bg-blue-500/15 text-blue-400 border-blue-500/25'
              : 'bg-slate-700/40 text-slate-400 border-slate-700/50'
          }`}
        >
          {pct}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-blue-500' : 'bg-slate-600'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const ACTIVITY_DATA = [8, 5, 12, 7, 15, 10, 20];
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const WeekActivityChart = () => {
  const max = Math.max(...ACTIVITY_DATA);
  return (
    <div className="flex items-end gap-1.5 h-10">
      {ACTIVITY_DATA.map((v, i) => {
        const h = max > 0 ? Math.round((v / max) * 40) : 4;
        const isToday = i === ACTIVITY_DATA.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              style={{ height: `${h}px` }}
              className={`w-full rounded-t-sm transition-all duration-700 ${
                isToday ? 'bg-blue-500' : 'bg-slate-700'
              }`}
            />
            <span
              className={`text-[9px] font-bold ${
                isToday ? 'text-blue-400' : 'text-slate-600'
              }`}
            >
              {DAYS[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const QUICK_MODULES = [
  {
    label: 'Bộ Từ Vựng',
    description: 'Thư viện cá nhân',
    icon: <BookOpen className="w-6 h-6" />,
    gradient: 'from-blue-600/20 to-blue-500/5 border-blue-500/25',
    iconColor: 'text-blue-400',
    route: ROUTES.VOCABULARIES.MY_VOCABULARY_SET,
  },
  {
    label: 'Cộng Đồng',
    description: 'Khám phá bộ từ',
    icon: <Star className="w-6 h-6" />,
    gradient: 'from-amber-600/15 to-amber-500/5 border-amber-500/20',
    iconColor: 'text-amber-400',
    route: ROUTES.VOCABULARIES.COMMUNITY,
  },
  {
    label: 'Học Nhanh',
    description: 'Ôn tập SRS hôm nay',
    icon: <Zap className="w-6 h-6" />,
    gradient: 'from-emerald-600/15 to-emerald-500/5 border-emerald-500/20',
    iconColor: 'text-emerald-400',
    route: ROUTES.VOCABULARIES.MY_VOCABULARY_SET,
  },
  {
    label: 'Thành Tích',
    description: 'Xem tiến trình',
    icon: <Award className="w-6 h-6" />,
    gradient: 'from-purple-600/15 to-purple-500/5 border-purple-500/20',
    iconColor: 'text-purple-400',
    route: ROUTES.VOCABULARIES.MY_VOCABULARY_SET,
  },
];

const DashboardHome = ({
  user,
  mySets = [],
  isLoadingSets = false,
  streak = 0,
  dailyProgress = 0,
  dailyGoal = 20,
}: DashboardHomeProps) => {
  const navigate = useNavigate();

  const displayName =
    user?.name ||
    user?.firstName ||
    user?.username ||
    user?.email?.split('@')[0] ||
    'bạn';

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`min-h-screen w-full bg-[#070b15] text-white flex flex-col transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-8 mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ── Greeting Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-slate-500 font-semibold">{formatDate()}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {getGreeting()},{' '}
              <span className="text-blue-400">{displayName}!</span> 👋
            </h1>
            <p className="text-sm text-slate-400">
              Hãy tiếp tục hành trình học từ vựng của bạn hôm nay.
            </p>
          </div>

          {/* Streak counter */}
          <div className="flex items-center gap-2 self-start sm:self-center px-4 py-3 bg-amber-950/30 border border-amber-800/40 rounded-xl">
            <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-amber-400 leading-none">
                {streak}
              </span>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                ngày liên tiếp
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Từ đã học',
              value: dailyProgress,
              unit: 'hôm nay',
              icon: <BookOpen className="w-4 h-4" />,
              color: 'text-blue-400',
              bg: 'from-blue-600/15 border-blue-500/25',
            },
            {
              label: 'Bộ từ',
              value: mySets.length,
              unit: 'đang học',
              icon: <Star className="w-4 h-4" />,
              color: 'text-amber-400',
              bg: 'from-amber-600/15 border-amber-500/25',
            },
            {
              label: 'Streak',
              value: streak,
              unit: 'ngày',
              icon: <Flame className="w-4 h-4" />,
              color: 'text-orange-400',
              bg: 'from-orange-600/15 border-orange-500/25',
            },
            {
              label: 'Thời gian',
              value: 24,
              unit: 'phút',
              icon: <Clock className="w-4 h-4" />,
              color: 'text-emerald-400',
              bg: 'from-emerald-600/15 border-emerald-500/25',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`flex flex-col gap-1.5 p-4 rounded-xl bg-gradient-to-br to-transparent border ${stat.bg}`}
            >
              <span
                className={`flex items-center gap-1.5 ${stat.color} text-[10px] font-extrabold uppercase tracking-widest`}
              >
                {stat.icon} {stat.label}
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] text-slate-500 font-semibold">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Daily Goal + Activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Goal Banner */}
          <div className="lg:col-span-2 flex flex-col gap-5 p-6 bg-[#0d1425] border border-slate-800/80 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between gap-4 z-10">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Lịch Ôn Tập Hôm Nay
                </span>
                <h2 className="text-xl font-extrabold text-white">
                  {mySets.length > 0 ? `${dailyProgress} từ cần ôn` : 'Chưa có từ nào để ôn'}
                </h2>
                <p className="text-sm text-slate-400">
                  {dailyProgress > 0
                    ? 'Dựa trên lịch SRS của bạn — đừng bỏ lỡ!'
                    : 'Thêm bộ từ vựng và bắt đầu học để hệ thống tạo lịch ôn tập.'}
                </p>
              </div>
              <button
                onClick={() => navigate(ROUTES.VOCABULARIES.MY_VOCABULARY_SET)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-600/20 shrink-0 whitespace-nowrap"
              >
                <Zap className="w-4 h-4" />
                Học Ngay
              </button>
            </div>

            <div className="z-10 flex flex-col gap-4">
              <DailyGoalBar current={dailyProgress} goal={dailyGoal} />
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">
                  Hoạt động 7 ngày
                </span>
                <WeekActivityChart />
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="flex flex-col gap-3 p-5 bg-[#0d1425] border border-slate-800/80 rounded-2xl">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              Truy Cập Nhanh
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {QUICK_MODULES.map((mod) => (
                <div
                  key={mod.label}
                  onClick={() => navigate(mod.route)}
                  className={`flex flex-col gap-2.5 p-3.5 rounded-xl border bg-gradient-to-br to-transparent cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${mod.gradient}`}
                >
                  <span className={mod.iconColor}>{mod.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">{mod.label}</span>
                    <span className="text-[10px] text-slate-500">{mod.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── My Vocabulary Sets ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white">Bộ từ đang học</h2>
            <button
              onClick={() => navigate(ROUTES.VOCABULARIES.MY_VOCABULARY_SET)}
              className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoadingSets ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-slate-900/40 border border-slate-800 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : mySets.length === 0 ? (
            <div
              className="flex flex-col items-center gap-3 p-8 bg-[#0d1425] border border-dashed border-slate-800 rounded-2xl text-center cursor-pointer hover:border-slate-700 transition-all"
              onClick={() => navigate(ROUTES.VOCABULARIES.CREATE)}
            >
              <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-300">Chưa có bộ từ nào</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tạo bộ từ vựng đầu tiên của bạn
                </p>
              </div>
              <span className="text-xs font-extrabold text-blue-400 border border-blue-500/30 bg-blue-500/10 px-4 py-2 rounded-xl">
                + Tạo Bộ Từ
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mySets.slice(0, 6).map((set) => (
                <SetProgressCard
                  key={set.id}
                  set={set}
                  onClick={() =>
                    navigate(
                      ROUTES.VOCABULARIES.OVERVIEW_SET_VOCABULARY_LEARNING.replace(
                        ':id',
                        set.id
                      )
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Challenge Banner ── */}
        <div className="relative flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-r from-blue-950/40 to-purple-950/30 border border-blue-900/40 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 pointer-events-none" />
          <div className="flex flex-col gap-2 flex-1 z-10">
            <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> Thử Thách Tuần Này
            </span>
            <h2 className="text-lg font-extrabold text-white">
              Học 100 từ mới trong tuần này
            </h2>
            <p className="text-sm text-slate-400">
              Hoàn thành thử thách để nhận 500 XP và danh hiệu đặc biệt
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-[32%] bg-gradient-to-r from-blue-600 to-purple-500 rounded-full" />
              </div>
              <span className="text-xs font-bold text-slate-400">32/100</span>
            </div>
          </div>
          <button
            onClick={() => navigate(ROUTES.VOCABULARIES.MY_VOCABULARY_SET)}
            className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-sm rounded-xl transition-all cursor-pointer z-10 whitespace-nowrap"
          >
            Tham gia <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default DashboardHome;
