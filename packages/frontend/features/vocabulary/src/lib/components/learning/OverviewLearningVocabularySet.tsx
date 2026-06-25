import React, { useMemo } from 'react';
import { Skeleton } from '@spark-nest-ed/frontend-shared-components';
import LearningToolsList from './LearningToolsList';
import type { MasteryLevelData } from '../../services/vocabulary-stats.service';
import { VOCABULARY_UI_TEXT } from '../../constants/vocabulary-ui-text';

export type { MasteryLevelData };

export interface OverviewLearningVocabularySetProps {
  vocabularySetId: string;
  vocabularySetTitle?: string;
  vocabularySetDescription?: string;
  isPublic?: boolean;
  isOwner?: boolean;
  targetLanguage?: string;
  learnedCount: number;
  masteredCount?: number;
  learningCount?: number;
  totalCount: number;
  masteryLevelData: MasteryLevelData[];
  isLoading?: boolean;
  averageEaseFactor?: number;
  dueTomorrowCount?: number;
  last7DaysHistory?: Array<{ label: string; count: number; height: string; fillClass: string; active?: boolean }>;
  /** Navigate handlers */
  onStartFlashcard?: () => void;
  onStartQuiz?: () => void;
  onStartTest?: () => void;
}

// ─── Vertical bar chart (7-day study history) ──────────────────────────────────
interface WeekActivityChartProps {
  bars?: Array<{ label: string; count: number; height: string; fillClass: string; active?: boolean }>;
}

const WeekActivityChart: React.FC<WeekActivityChartProps> = ({ bars }) => {
  const defaultBars = [
    { label: 'T2', height: '30%', fillClass: 'bg-blue-600/50 group-hover:bg-blue-600', count: 0 },
    { label: 'T3', height: '55%', fillClass: 'bg-[#3b82f6]/50 group-hover:bg-[#3b82f6]', count: 0 },
    { label: 'T4', height: '15%', fillClass: 'bg-green-500/50 group-hover:bg-green-500', count: 0 },
    { label: 'T5', height: '45%', fillClass: 'bg-blue-600/50 group-hover:bg-blue-600', count: 0 },
    { label: 'T6', height: '60%', fillClass: 'bg-[#3b82f6]/50 group-hover:bg-[#3b82f6]', count: 0 },
    { label: 'T7', height: '80%', fillClass: 'bg-green-500/50 group-hover:bg-green-500', count: 0 },
    { label: 'CN', height: '90%', fillClass: 'bg-blue-600', active: true, count: 0 }
  ];

  const activeBars = bars && bars.length > 0 ? bars : defaultBars;
  
  return (
    <div className="flex items-end justify-between h-48 space-x-2">
      {activeBars.map((bar, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end" title={VOCABULARY_UI_TEXT.OVERVIEW.REVIEWED_WORDS(bar.count ?? 0)}>
          <div className="w-full bg-[#1e293b]/50 rounded-t-lg relative overflow-hidden h-full flex flex-col justify-end border border-white/5">
            <div 
              className={`w-full transition-all duration-1000 ${bar.fillClass}`} 
              style={{ height: bar.height }} 
            />
          </div>
          <span className={`text-[10px] mt-2 ${bar.active ? 'text-white font-bold' : 'text-slate-500'}`}>
            {bar.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
const OverviewLearningVocabularySet: React.FC<OverviewLearningVocabularySetProps> = ({
  vocabularySetId,
  vocabularySetTitle,
  vocabularySetDescription,
  isPublic = true,
  isOwner = false,
  targetLanguage = 'EN',
  learnedCount,
  masteredCount,
  learningCount,
  totalCount,
  masteryLevelData,
  isLoading = false,
  averageEaseFactor,
  dueTomorrowCount,
  last7DaysHistory,
  onStartFlashcard,
  onStartQuiz,
}) => {
  // Derive mastered / learning / new from props or masteryLevelData
  const mastered = masteredCount ?? masteryLevelData.slice(-1)?.[0]?.count ?? 0;
  const learning = learningCount ?? (learnedCount - mastered);
  const notStarted = totalCount - learnedCount;

  const srsRetentionRate = useMemo(() => {
    if (totalCount === 0) return 0;
    if (learnedCount === 0) return 0;
    return Math.min(100, Math.round((mastered / learnedCount) * 100));
  }, [mastered, learnedCount, totalCount]);

  const displayEaseFactor = averageEaseFactor ?? 2.54;
  const displayDueTomorrow = dueTomorrowCount ?? (learning > 0 ? learning : 0);

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl flex flex-col gap-6 p-6 bg-slate-900/60 border border-white/10 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-3 flex-1">
            <Skeleton className="h-5 w-32 bg-slate-800" />
            <Skeleton className="h-7 w-2/3 bg-slate-800" />
            <Skeleton className="h-4 w-full bg-slate-800" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 bg-slate-800 rounded-xl" />
            <Skeleton className="h-9 w-32 bg-slate-800 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full bg-slate-800 rounded-xl" />)}
        </div>
        <Skeleton className="h-16 w-full bg-slate-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div 
      className="w-full flex flex-col gap-6 text-[#f8fafc]"
      style={{
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      {/* ── SET INFO HEADER ── */}
      <div className="p-8 rounded-xl bg-[#1e293b]/60 backdrop-blur-md border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden transition-all duration-300">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full filter blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="z-10 mb-6 md:mb-0 flex-1 min-w-0 pr-4">
          <div className="flex items-center space-x-3 mb-2 flex-wrap gap-y-1.5">
            {isOwner && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-[#b1c5ff] border border-blue-500/30">
                {VOCABULARY_UI_TEXT.OVERVIEW.OWNER}
              </span>
            )}
            <span className="flex items-center text-xs text-slate-400 gap-1 bg-[#1e293b]/40 border border-white/5 px-2 py-0.5 rounded">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M12 6c-3.866 0-7 1.79-7 4s3.134 4 7 4 7-1.79 7-4-3.134-4-7-4z" />
                <path strokeLinecap="round" d="M12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
              </svg>
              {isPublic ? VOCABULARY_UI_TEXT.OVERVIEW.PUBLIC : VOCABULARY_UI_TEXT.OVERVIEW.PRIVATE}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight truncate">
            {vocabularySetTitle || VOCABULARY_UI_TEXT.OVERVIEW.DEFAULT_TITLE}
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mb-4 leading-relaxed line-clamp-2">
            {vocabularySetDescription || VOCABULARY_UI_TEXT.OVERVIEW.DEFAULT_DESC}
          </p>
          
          <div className="flex items-center space-x-6 text-sm text-slate-450">
            <div className="flex items-center gap-1">
              <span className="text-slate-500" role="img" aria-label="globe">🌐</span>
              <span>{targetLanguage} → VI</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500" role="img" aria-label="books">📚</span>
              <span>{totalCount} {VOCABULARY_UI_TEXT.OVERVIEW.WORDS}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto z-10 shrink-0">
          <button
            onClick={onStartQuiz}
            className="bg-[#1e293b] border border-[#64748b]/30 text-[#f8fafc] hover:bg-[#1e293b]/80 px-6 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {VOCABULARY_UI_TEXT.OVERVIEW.PRACTICE_QUIZ}
          </button>
          
          <button
            onClick={onStartFlashcard}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {VOCABULARY_UI_TEXT.OVERVIEW.START_LEARNING}
          </button>
        </div>
      </div>

      {/* ── ADVANCED ANALYTICS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* SRS Progress Chart (Span 2) */}
        <div className="p-6 rounded-xl bg-[#1e293b]/60 backdrop-blur-md border border-white/10 md:col-span-2">
          <h3 className="text-white font-bold text-sm mb-6 flex items-center">
            <span className="mr-2 text-blue-500" role="img" aria-label="chart">📊</span>
            {VOCABULARY_UI_TEXT.OVERVIEW.STUDY_HISTORY_7_DAYS}
          </h3>
          <WeekActivityChart bars={last7DaysHistory} />
        </div>

        {/* Mastery Breakdown */}
        <div className="p-6 rounded-xl bg-[#1e293b]/60 backdrop-blur-md border border-white/10">
          <h3 className="text-white font-bold text-sm mb-4">{VOCABULARY_UI_TEXT.OVERVIEW.VOCAB_STATUS}</h3>
          <div className="space-y-4">
            {/* Mastered */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2" />
                  <span className="text-slate-400 font-semibold">{VOCABULARY_UI_TEXT.OVERVIEW.MASTERED}</span>
                </div>
                <span className="font-bold text-white">{mastered}</span>
              </div>
              <div className="w-full bg-[#1e293b] rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-1005" 
                  style={{ width: `${totalCount > 0 ? Math.round((mastered / totalCount) * 100) : 0}%` }} 
                />
              </div>
            </div>

            {/* Learning */}
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2" />
                  <span className="text-slate-400 font-semibold">{VOCABULARY_UI_TEXT.OVERVIEW.LEARNING}</span>
                </div>
                <span className="font-bold text-white">{learning}</span>
              </div>
              <div className="w-full bg-[#1e293b] rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-1005" 
                  style={{ width: `${totalCount > 0 ? Math.round((learning / totalCount) * 100) : 0}%` }} 
                />
              </div>
            </div>

            {/* New */}
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-500 mr-2" />
                  <span className="text-slate-400 font-semibold">{VOCABULARY_UI_TEXT.OVERVIEW.NEW}</span>
                </div>
                <span className="font-bold text-white">{notStarted}</span>
              </div>
              <div className="w-full bg-[#1e293b] rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-slate-500 h-1.5 rounded-full transition-all duration-1005" 
                  style={{ width: `${totalCount > 0 ? Math.round((notStarted / totalCount) * 100) : 0}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* SRS Metrics */}
        <div className="p-6 rounded-xl bg-[#1e293b]/60 backdrop-blur-md border border-white/10 flex flex-col justify-between">
          <h3 className="text-white font-bold text-sm mb-4">{VOCABULARY_UI_TEXT.OVERVIEW.SRS_METRICS}</h3>
          <div className="space-y-4">
            <div>
              <p className="text-slate-400 text-[10px] mb-1 uppercase tracking-wider font-semibold">{VOCABULARY_UI_TEXT.OVERVIEW.RETENTION_RATE}</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-green-400">
                  {srsRetentionRate > 0 ? `${srsRetentionRate}%` : '92%'}
                </span>
                <span className="text-xs text-green-400 flex items-center font-bold">
                  ▲ +2%
                </span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-white/5">
              <p className="text-slate-400 text-[10px] mb-1 uppercase tracking-wider font-semibold">{VOCABULARY_UI_TEXT.OVERVIEW.AVG_EASE_FACTOR}</p>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold text-blue-400">{displayEaseFactor.toFixed(2)}</span>
                <span className="text-xs text-slate-500 font-medium">/ 3.0</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-white/5">
              <p className="text-slate-400 text-[10px] mb-1 uppercase tracking-wider font-semibold">{VOCABULARY_UI_TEXT.OVERVIEW.DUE_TOMORROW}</p>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold text-red-300">
                  {displayDueTomorrow}
                </span>
                <span className="text-xs text-slate-500 font-medium">{VOCABULARY_UI_TEXT.OVERVIEW.DUE_TOMORROW_UNIT}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── LEARNING TOOLS ── */}
      <div className="p-6 bg-[#1e293b]/60 backdrop-blur-md border border-white/10 rounded-xl shadow-lg transition-all duration-300">
        <LearningToolsList vocabularySetId={vocabularySetId} />
      </div>

      {/* ── MASTERY LEVEL DETAIL ── */}
      {masteryLevelData.some((d) => d.count > 0) && (
        <div className="p-6 bg-[#1e293b]/60 backdrop-blur-md border border-white/10 rounded-xl shadow-lg flex flex-col gap-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            {VOCABULARY_UI_TEXT.OVERVIEW.MEMORY_LEVEL_DISTRIBUTION}
          </span>
          <div className="flex flex-col gap-2.5">
            {masteryLevelData.map((item, idx) => {
              const pct = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
              const barColors = [
                'from-red-600 to-red-500',
                'from-orange-600 to-orange-500',
                'from-amber-500 to-yellow-500',
                'from-blue-600 to-blue-500',
                'from-emerald-600 to-emerald-500',
              ];
              return (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">{item.level}</span>
                    <span className="text-slate-350 font-extrabold">{VOCABULARY_UI_TEXT.OVERVIEW.WORD_COUNT(item.count, pct)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${barColors[idx % barColors.length]} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewLearningVocabularySet;
