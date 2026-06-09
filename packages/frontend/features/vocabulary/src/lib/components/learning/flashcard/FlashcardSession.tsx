import React from 'react';
import { Volume2, Flame, Lightbulb, Settings, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import type { FlashcardWord } from '../../../types';

export interface FlashcardSessionProps {
  title: string;
  currentCard: FlashcardWord;
  currentIndex: number;
  totalCards: number;
  isFlipped: boolean;
  showHint: boolean;
  focusMode: boolean;
  autoPlayAudio: boolean;
  autoShowHint: boolean;
  elapsedTime: string;
  remainingTime: string;
  stats: {
    newCount: number;
    learningCount: number;
    masteredCount: number;
    accuracyRate: number;
    avgResponseTime: number;
  };
  userStreak: number;
  sessionCards: FlashcardWord[];
  sessionGrades: { [itemId: string]: number };
  onFlip: () => void;
  onGrade: (quality: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleFocusMode: () => void;
  onToggleAutoPlay: () => void;
  onToggleAutoShowHint: () => void;
  onToggleShowHint: () => void;
  onPlayAudio: (e?: React.MouseEvent) => void;
  onPageSelect: (index: number) => void;
  onChangeStudyMode?: () => void;
}

export const FlashcardSession: React.FC<FlashcardSessionProps> = ({
  title,
  currentCard,
  currentIndex,
  totalCards,
  isFlipped,
  showHint,
  focusMode,
  autoPlayAudio,
  autoShowHint,
  elapsedTime,
  remainingTime,
  stats,
  userStreak,
  sessionCards,
  sessionGrades,
  onFlip,
  onGrade,
  onPrev,
  onNext,
  onToggleFocusMode,
  onToggleAutoPlay,
  onToggleAutoShowHint,
  onToggleShowHint,
  onPlayAudio,
  onPageSelect,
  onChangeStudyMode,
}) => {
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  
  const progressPercentage = totalCards > 0 ? Math.round(((currentIndex + 1) / totalCards) * 100) : 0;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const wordData = currentCard.item.wordMinimum || {
    word: currentCard.item.customWord || '',
    definition: currentCard.item.customDefinition || '',
    example: currentCard.item.customExample || '',
    pronunciation: '',
    partOfSpeech: '',
  };

  const word = currentCard.item.customWord || wordData.word;
  const definition = currentCard.item.customDefinition || wordData.definition;
  const example = currentCard.item.customExample || wordData.example;
  const pronunciation = wordData.pronunciation;
  const partOfSpeech = wordData.partOfSpeech;
  const notes = currentCard.item.notes;

  const isC1 = pronunciation?.toLowerCase().includes('c1') || partOfSpeech?.toLowerCase().includes('c1');

  // Render clickable pagination items
  const renderPagingDots = () => {
    return (
      <div className="flex flex-wrap items-center justify-center gap-1.5 py-2.5 w-full max-w-3xl mx-auto">
        {sessionCards.map((card, index) => {
          const isCurrent = index === currentIndex;
          const itemId = card?.item?.id;
          const grade = itemId && sessionGrades ? sessionGrades[itemId] : null;
          
          let dotColor = 'bg-slate-800 hover:bg-slate-700';
          let borderStyle = 'border border-slate-700/50';
          
          if (isCurrent) {
            dotColor = 'bg-blue-600 ring-2 ring-blue-500/50 scale-110';
            borderStyle = 'border border-blue-400';
          } else if (grade !== null && grade !== undefined) {
            borderStyle = 'border-transparent';
            if (grade === 1) {
              dotColor = 'bg-red-500/80';
            } else if (grade === 2) {
              dotColor = 'bg-slate-500';
            } else if (grade === 4) {
              dotColor = 'bg-blue-600/80';
            } else if (grade === 5) {
              dotColor = 'bg-emerald-500/80';
            }
          }

          return (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                onPageSelect(index);
              }}
              className={`h-6.5 min-w-[26px] px-2 rounded-full transition-all duration-300 ${dotColor} ${borderStyle} text-[10px] font-black flex items-center justify-center text-white/90 select-none shadow-sm hover:scale-105 cursor-pointer`}
              title={`Thẻ ${index + 1}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 text-white min-h-[600px] select-none bg-[#070b15] p-6 sm:p-8 rounded-2xl border border-slate-900 shadow-2xl">
      {/* 🧭 TOP BAR NAVIGATION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold tracking-wider text-blue-400 uppercase max-w-[120px] sm:max-w-xs truncate">
            {title}
          </span>
          <span className="h-4 w-px bg-slate-800" />
          <span className="text-sm text-slate-400 font-medium">
            Thẻ {currentIndex + 1} / {totalCards}
          </span>
          {onChangeStudyMode && (
            <>
              <span className="h-4 w-px bg-slate-800" />
              <button
                onClick={onChangeStudyMode}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Đổi chế độ
              </button>
            </>
          )}
        </div>
        
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
          {/* Focus Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Focus Mode</span>
            <button
              onClick={onToggleFocusMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none cursor-pointer ${
                focusMode ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  focusMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Hint Button */}
          <button
            onClick={onToggleShowHint}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              showHint || autoShowHint
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700/50 hover:bg-slate-700'
            }`}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            HIỂN THỊ GỢI Ý
          </button>
        </div>
      </div>

      {/* 🔢 CLICKABLE PAGINATION PROGRESS PILLS */}
      <div className="w-full flex flex-col gap-2 pb-2 border-b border-slate-800/40">
        {renderPagingDots()}
      </div>

      {/* 🔮 MAIN WORKSPACE SECTION */}
      <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch mt-2">
        
        {/* LEFT COLUMN: THE FLASHCARD & NAVIGATION */}
        <div className={`flex flex-col flex-grow gap-6 transition-all duration-500 ${focusMode ? 'w-full' : 'lg:w-2/3 w-full'}`}>
          
          {/* 🎴 FLASHCARD CONTAINER */}
          <div 
            onClick={onFlip}
            className="w-full h-[430px] flip-card-container cursor-pointer"
          >
            <div className={`w-full h-full flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
              
              {/* CARD FRONT PANEL (Added p-12 sm:p-14 inside front/back card) */}
              <div className="flip-card-front gradient-border w-full h-full flex flex-col justify-between p-10 sm:p-12 bg-[#0d1425] shadow-2xl rounded-2xl border border-slate-800/80">
                {/* Header labels */}
                <div className="flex items-center justify-between w-full p-4">
                  <div className="flex gap-2">
                    {isC1 && (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-400 border border-blue-600/30">
                        C1
                      </span>
                    )}
                    {partOfSpeech && (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-600/20 text-purple-400 border border-purple-600/30 capitalize">
                        {partOfSpeech}
                      </span>
                    )}
                  </div>
                  
                  {currentCard.progress && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      currentCard.progress.status === 'MASTERED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    }`}>
                      {currentCard.progress.status}
                    </span>
                  )}
                </div>

                {/* Central Term & Pronunciation */}
                <div className="p-4 flex flex-col items-center justify-center flex-grow gap-4 text-center">
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white select-text leading-tight max-w-xl">
                    {word}
                  </h1>
                  {pronunciation && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base sm:text-lg text-slate-400 font-medium select-text">
                        {pronunciation}
                      </span>
                      <button
                        onClick={onPlayAudio}
                        className="p-2 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/25 transition-colors duration-200 cursor-pointer"
                        title="Phát âm"
                      >
                        <Volume2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Tip */}
                <div className="p-4 flex flex-col items-center justify-center w-full gap-2">
                  {(showHint || autoShowHint) && notes && (
                    <p className="text-xs text-amber-400 bg-amber-500/5 px-4 py-2 rounded-lg border border-amber-500/10 text-center max-w-lg mb-2">
                      Gợi ý: {notes}
                    </p>
                  )}
                  <span className="text-xs text-slate-500 font-medium animate-pulse">
                    Nhấn vào thẻ hoặc phím Cách để xem nghĩa
                  </span>
                </div>
              </div>

              {/* CARD BACK PANEL */}
              <div className="flip-card-back gradient-border w-full h-full flex flex-col justify-between p-10 sm:p-12 bg-[#0f172a] shadow-2xl rounded-2xl border border-slate-800/80">
                {/* Header labels */}
                <div className="flex items-center justify-between w-full p-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Định nghĩa & Ví dụ
                  </span>
                  {partOfSpeech && (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-600/20 text-purple-400 border border-purple-600/30 capitalize">
                      {partOfSpeech}
                    </span>
                  )}
                </div>

                {/* Central Data */}
                <div className="flex flex-col justify-center flex-grow gap-4 px-4">
                  {/* Definition */}
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      Định nghĩa
                    </span>
                    <p className="text-lg sm:text-xl text-slate-100 font-semibold select-text leading-relaxed">
                      {definition}
                    </p>
                  </div>

                  {/* Example Sentence */}
                  {example && (
                    <div className="flex flex-col gap-1 border-t border-slate-800/50 pt-3 text-left">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Ví dụ minh họa
                      </span>
                      <p className="text-sm sm:text-base text-slate-300 italic select-text leading-relaxed">
                        "{example}"
                      </p>
                    </div>
                  )}

                  {/* SRS Progress Details */}
                  {currentCard.progress && (
                    <div className="flex items-center justify-between gap-4 border-t border-slate-800/50 pt-3 text-xs select-text">
                      <div className="flex flex-col gap-1.5 text-left">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Tiến độ nhớ</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${(currentCard.progress.masteryLevel || 0) * 100}%` }} />
                          </div>
                          <span className="font-bold text-slate-300">{Math.round((currentCard.progress.masteryLevel || 0) * 100)}%</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lần lặp</span>
                        <span className="font-extrabold text-blue-400">{currentCard.progress.repetitions || 0} lần</span>
                      </div>
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chu kỳ (SRS)</span>
                        <span className="font-extrabold text-amber-500">{currentCard.progress.interval || 1} ngày</span>
                      </div>
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chuỗi nhớ</span>
                        <span className="font-extrabold text-rose-500">{currentCard.progress.streak || 0} <span role="img" aria-label="fire">🔥</span></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer notes */}
                <div className="w-full text-center p-2">
                  <span className="text-xs text-slate-500 font-medium">
                    Nhấn vào thẻ để xem lại mặt trước
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* 🎛️ BINARY GRADING CONTROL BUTTONS */}
          <div className="flex flex-col w-full gap-3 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={(e) => { e.stopPropagation(); onGrade(1); }}
                className="flex flex-col items-center justify-center py-4 px-6 rounded-xl border border-red-500/25 bg-red-950/20 hover:bg-red-950/45 text-red-400 hover:border-red-500/50 shadow-md shadow-red-950/10 transition-all duration-300 group hover:scale-[1.01] cursor-pointer"
              >
                <span className="text-lg font-black tracking-wide group-hover:scale-105 transition-transform duration-200">
                  Chưa thuộc
                </span>
                <span className="text-[10px] text-red-500/70 font-bold mt-1 uppercase tracking-widest">
                  Lặp lại sớm trong phiên học
                </span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); onGrade(4); }}
                className="flex flex-col items-center justify-center py-4 px-6 rounded-xl border border-emerald-500/25 bg-emerald-950/20 hover:bg-emerald-950/45 text-emerald-400 hover:border-emerald-500/50 shadow-md shadow-emerald-950/10 transition-all duration-300 group hover:scale-[1.01] cursor-pointer"
              >
                <span className="text-lg font-black tracking-wide group-hover:scale-105 transition-transform duration-200">
                  Đã thuộc
                </span>
                <span className="text-[10px] text-emerald-500/70 font-bold mt-1 uppercase tracking-widest">
                  Lên lịch ôn tập (Spaced Repetition)
                </span>
              </button>
            </div>
            
            <div className="flex items-center justify-between px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span>Nhấn phím 1 để báo Chưa thuộc, phím 2 để báo Đã thuộc</span>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onPrev(); }}
                  disabled={currentIndex === 0}
                  className="flex items-center p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  title="Thẻ trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onNext(); }}
                  disabled={currentIndex === totalCards - 1}
                  className="flex items-center p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  title="Thẻ sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* 📊 RIGHT COLUMN: STATISTICS & SETTINGS PANEL */}
        {!focusMode && (
          <div className="w-full lg:w-1/3 flex flex-col gap-6 animate-fade-in transition-all duration-500">
            
            {/* 📈 SESSION INFO MODULE */}
            <div className="flex flex-col p-5 bg-[#0b1324] border border-slate-800/80 rounded-2xl gap-5 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold tracking-wider uppercase text-slate-300">
                  Thông tin phiên học
                </h3>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>

              {/* Time Clocks */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800/60 text-left">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    ELAPSED
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-200">
                    {elapsedTime}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    REMAINING
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-200">
                    {remainingTime}
                  </span>
                </div>
              </div>

              {/* Circular Progress Ring */}
              <div className="flex items-center justify-center py-2">
                <div className="relative flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r={radius}
                      className="text-slate-800"
                      strokeWidth={strokeWidth}
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r={radius}
                      className="text-blue-500 transition-all duration-500 ease-out"
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-extrabold text-white">
                      {currentIndex + 1}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      / {totalCards}
                    </span>
                  </div>
                </div>
              </div>

              {/* Queue Classification */}
              <div className="flex flex-col gap-2.5 pb-4 border-b border-slate-800/60">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    <span className="text-slate-400">Mới</span>
                  </div>
                  <span className="font-bold text-slate-200">{stats.newCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-slate-400">Đang học</span>
                  </div>
                  <span className="font-bold text-blue-400">{stats.learningCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-400">Đã thành thạo</span>
                  </div>
                  <span className="font-bold text-emerald-400">{stats.masteredCount}</span>
                </div>
              </div>

              {/* Deep Parameters */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Accuracy Rate</span>
                  <span className="font-extrabold text-emerald-400">{stats.accuracyRate}%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Avg. Response Time</span>
                  <span className="font-extrabold text-slate-200">{stats.avgResponseTime}s</span>
                </div>
                
                {/* Retention Curve SVG */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase text-left">
                    RETENTION CURVE
                  </span>
                  <div className="w-full h-10 bg-slate-900/30 rounded-lg overflow-hidden border border-slate-800/30">
                    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25"/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,15 C20,15 40,25 60,25 C80,25 100,28 100,28 L100,40 L0,40 Z"
                        fill="url(#waveGradient)"
                      />
                      <path
                        d="M0,15 C20,15 40,25 60,25 C80,25 100,28 100,28"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

            </div>

            {/* 🔥 STREAK STABILITY MODULE */}
            <div className="flex items-center justify-between p-5 bg-[#0b1324] border border-slate-800/80 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-3.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Flame className="h-6 w-6 fill-amber-500 animate-pulse" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    CHUỖI NGÀY HỌC
                  </span>
                  <span className="text-2xl font-extrabold text-white leading-tight">
                    {userStreak} Ngày
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[9px] font-extrabold text-amber-500/80 uppercase tracking-wider bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                  CURRENT STREAK
                </span>
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500" 
                    style={{ width: `${Math.min(100, (userStreak / 30) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* ⚙️ QUICK SETTINGS MODULE */}
            <div className="flex flex-col p-5 bg-[#0b1324] border border-slate-800/80 rounded-2xl gap-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold tracking-wider uppercase text-slate-300">
                  QUICK SETTINGS
                </h3>
                <Settings className="h-4 w-4 text-slate-500" />
              </div>

              <div className="flex flex-col gap-3">
                {/* Auto Play Setting */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Auto-play audio</span>
                  <button
                    onClick={onToggleAutoPlay}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                      autoPlayAudio ? 'bg-blue-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                        autoPlayAudio ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Auto Show Hints */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Show hints automatically</span>
                  <button
                    onClick={onToggleAutoShowHint}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                      autoShowHint ? 'bg-blue-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                        autoShowHint ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
