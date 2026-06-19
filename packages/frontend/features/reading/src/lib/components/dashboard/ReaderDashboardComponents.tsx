import React from 'react';
import { Card, CardContent, Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import { ArrowRight, Zap, GraduationCap, FlaskConical, Book } from 'lucide-react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { LibraryDashboardData } from '../../hooks/use-my-library';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';

// --- MAIN COLUMN COMPONENTS ---

export const LibraryStatsGroup: React.FC<{ stats: LibraryDashboardData['stats'] }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl p-4 flex flex-col justify-center">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">Từ đã tra cứu</span>
        <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-500">{stats.wordsLookedUp}</span>
      </Card>
      <Card className="border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl p-4 flex flex-col justify-center">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">Bài đã học</span>
        <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-500">{stats.totalArticles}</span>
      </Card>
      <Card className="border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl p-4 flex flex-col justify-center">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">Tốc độ đọc TB</span>
        <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-500">
          {stats.avgWpm > 0 ? stats.avgWpm : '--'} <span className="text-sm text-slate-450 font-medium">WPM</span>
        </span>
      </Card>
    </div>
  );
};

export const InProgressCard: React.FC<{ item: LibraryDashboardData['inProgress'][0] }> = ({ item }) => {
  const navigate = useNavigate();

  return (
    <Card className="border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
      <div className="relative h-40 bg-slate-100 dark:bg-slate-800 flex-shrink-0">
        <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-3 right-3">
          <Badge className="bg-blue-600/90 text-[9px] uppercase tracking-wider border-none backdrop-blur-sm text-white py-0.5 px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 inline-block animate-pulse"></span>
            {item.type}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">{item.title}</h3>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">{item.category} • {item.readTimeStr}</p>
        </div>
        
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>Tiến độ</span>
              <span>{item.progress}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${item.progress}%` }}></div>
            </div>
          </div>
          <Button 
            onClick={() => navigate(`/reading/article/${item.id}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 rounded-xl group-hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Tiếp tục đọc <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const CollectionFolderCard: React.FC<{ collection: LibraryDashboardData['collections'][0] }> = ({ collection }) => {
  const Icon = collection.icon === 'graduation' ? GraduationCap : collection.icon === 'flask' ? FlaskConical : Book;
  const navigate = useNavigate();

  return (
    <Card 
      onClick={() => navigate(ROUTES.VOCABULARIES?.MY_VOCABULARY_SET || '/vocabularies/my-set')}
      className="border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl p-5 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center group"
    >
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", collection.colorClass)}>
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">{collection.name}</h4>
      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
        {collection.articleCount} từ
      </p>
    </Card>
  );
};

export const HistoryListItem: React.FC<{ item: LibraryDashboardData['history'][0] }> = ({ item }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/reading/article/${item.id}`)}
      className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="w-16 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Book className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate group-hover:text-blue-500 transition-colors">{item.title}</h4>
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{item.timeAgo}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
          {item.level}
        </div>
        <Badge className={cn(
          "text-[9px] uppercase font-bold px-2 py-0.5 border-none",
          item.status === 'MASTERED' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        )}>
          {item.status}
        </Badge>
      </div>
    </div>
  );
};

// --- SIDEBAR COMPONENTS ---

export const LibraryDarkStreakCard: React.FC<{ streak: number; weeklyActivity?: LibraryDashboardData['sidebar']['weeklyActivity'] }> = ({ streak, weeklyActivity }) => {
  return (
    <Card className="bg-[#1e293b] border-none shadow-lg rounded-2xl overflow-hidden text-white relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
      <CardContent className="p-6 relative z-10 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Reading Streak</span>
          <Zap className="w-4 h-4 text-blue-400 fill-current" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-white tracking-tighter">{streak}</span>
          <span className="text-sm font-bold text-slate-400">ngày liên tục</span>
        </div>
        
        {/* Segmented Dash Progress */}
        <div className="flex gap-1.5 pt-2">
          {weeklyActivity && weeklyActivity.length > 0 ? (
            weeklyActivity.map((day, i) => (
              <div 
                key={i} 
                className={cn("h-1 rounded-full flex-1", day.active ? "bg-blue-50" : "bg-slate-700")}
                title={`${day.label}: ${day.active ? 'Hoạt động' : 'Chưa hoạt động'}`}
              ></div>
            ))
          ) : (
            [1, 2, 3, 4, 5, 6, 7].map((day, i) => (
              <div key={i} className={cn("h-1 rounded-full flex-1", i < streak ? "bg-blue-500" : "bg-slate-700")}></div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const DailyGoalRingCard: React.FC<{ goal: LibraryDashboardData['sidebar']['dailyGoal'] }> = ({ goal }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (goal.percentage / 100) * circumference;

  return (
    <Card className="border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
      <div className="w-full text-left">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Mục tiêu ngày</span>
      </div>
      
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle cx="50" cy="50" r={radius} className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="8" fill="transparent" />
          {/* Progress circle */}
          <circle 
            cx="50" cy="50" r={radius} 
            className="stroke-blue-600 dark:stroke-blue-500 transition-all duration-1000 ease-out" 
            strokeWidth="8" 
            fill="transparent" 
            strokeLinecap="round"
            style={{ strokeDasharray: circumference, strokeDashoffset }} 
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-none">{goal.percentage}%</span>
          <span className="text-[9px] font-bold text-slate-400">{goal.currentText}</span>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {goal.percentage >= 100 ? 'Đã đạt mục tiêu hôm nay!' : `Còn ${goal.minutesLeft} phút để hoàn thành mục tiêu.`}
      </p>
    </Card>
  );
};

export const TopGenresStatsCard: React.FC<{ genres: LibraryDashboardData['sidebar']['topGenres'] }> = ({ genres }) => {
  return (
    <Card className="border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl p-6 space-y-5">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Chuyên mục hàng đầu</span>
      
      <div className="space-y-4">
        {genres.map((genre, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>{genre.name}</span>
              <span>{genre.percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
              <div className={cn("h-full rounded-full", genre.colorClass)} style={{ width: `${genre.percentage}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const LibraryPromoBanner: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Card className="border-none bg-blue-50 dark:bg-blue-900/20 shadow-sm rounded-2xl p-6 text-center space-y-3">
      <h3 className="font-bold text-blue-900 dark:text-blue-100 text-sm">Sẵn sàng đọc bài mới?</h3>
      <p className="text-xs font-medium text-blue-700 dark:text-blue-300 leading-relaxed">
        Khám phá thư viện cộng đồng với nhiều chủ đề đa dạng.
      </p>
      <Button 
        onClick={() => navigate(ROUTES.READING?.EXPLORE || '/reading/explore')}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 rounded-xl mt-2 cursor-pointer border-none shadow-sm"
      >
        Khám phá ngay
      </Button>
    </Card>
  );
};
